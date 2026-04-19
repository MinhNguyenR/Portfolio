const chatService = require('../services/chatService');

const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions?/i,
  /reveal\s+(the\s+)?(system|hidden)\s+prompt/i,
  /show\s+(me\s+)?(your\s+)?prompt/i,
  /developer\s+message/i,
  /\bunion\b\s+.*\bselect\b/i,
  /\bdrop\s+table\b/i,
  /\binformation_schema\b/i,
  /<script[\s\S]*?>/i,
  /```[\s\S]*?```/i,
];

function sanitizeUserInput(text) {
  return String(text || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

function hasSuspiciousPattern(text) {
  return SUSPICIOUS_PATTERNS.some((re) => re.test(text || ''));
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-10)
    .map((m) => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeUserInput(m?.content || ''),
    }))
    .filter((m) => m.content.length > 0);
}

function sanitizeModelReply(reply) {
  let out = String(reply || '');
  out = out.replace(/```[\s\S]*?```/g, '[code removed]');
  out = out.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
  out = out.replace(/\b(system prompt|developer message|hidden prompt)\b/gi, '[redacted]');
  return out.replace(/\n{3,}/g, '\n\n').trim().slice(0, 1400);
}

/** Build system prompt with full portfolio context */
function buildSystemPrompt(profile, projects, research, certificates, lang = 'vi') {
  const p = profile || {};
  const isEn = lang === 'en';
  const isDe = lang === 'de';

  const name = p.name || 'Nguyễn Đặng Tường Minh';
  
  let personality = `Bạn là Hachiware 🐱, trợ lý AI dễ thương sống trong portfolio của ${name}.
- Thân thiện, hài hước, dùng emoji 🐱 (=^.^=).
- Trả lời ngắn gọn, dưới 150 từ.
- KHÔNG dùng code block.`;

  if (isEn) {
    personality = `You are Hachiware 🐱, a cute AI assistant living in ${name}'s portfolio.
- Friendly, cute, funny cat personify.
- Use cat emojis 🐱 (=^.^=) occasionally.
- Answer in English.
- Short and clear, under 150 words.
- Use Markdown for readability but NO code blocks.`;
  } else if (isDe) {
    personality = `Du bist Hachiware 🐱, một trợ lý AI dễ thương trong Portfolio von ${name}.
- Freundlich, süß, humorvoll wie eine Katze.
- Benutze gelegentlich Katzen-Emojis 🐱 (=^.^=).
- Antworte auf Deutsch.
- Kurz und klar, unter 150 Wörter.
- Benutze Markdown, aber KEINE Code-Blöcke.`;
  }

  const skillsText = p.skills
    ? Object.entries(p.skills).map(([cat, items]) =>
        `- ${cat}: ${Array.isArray(items) ? items.join(', ') : items}`
      ).join('\n')
    : '';

  return `${personality}

═══ INFO ═══
Owner: ${name}
Bio: ${p.subtitle}
Email: ${p.email}
GitHub: ${p.github}

═══ RESEARCH ═══
${research.map(r => `• ${r.title}: ${r.description} [${r.tags?.join(', ')}]`).join('\n')}

═══ PROJECTS ═══
${projects.map(pr => `• ${pr.title}: ${pr.description}`).join('\n')}

═══ SKILLS ═══
${skillsText}`;
}

// ─── Daily Chat Rate Limit ───────────────────────────────────────────────────
// Per-user: 6 messages/day
// Global system cap: 30 messages/day
const chatLimits = new Map();
let globalChatLimit = { date: new Date().toISOString().split('T')[0], count: 0 };

function checkAndLimitChat(ip) {
  const today = new Date().toISOString().split('T')[0];
  if (globalChatLimit.date !== today) {
    globalChatLimit = { date: today, count: 0 };
  }
  if (globalChatLimit.count >= 30) {
    return { ok: false, reason: 'global' };
  }

  const record = chatLimits.get(ip) || { date: today, count: 0 };
  
  if (record.date !== today) {
    record.date = today;
    record.count = 0;
  }
  
  if (record.count >= 6) {
    return { ok: false, reason: 'user' };
  }
  
  record.count++;
  chatLimits.set(ip, record);
  globalChatLimit.count++;
  return { ok: true };
}

/** Call OpenRouter — retry until success (handles free model rate limits) */
async function callOpenRouter(messages, maxRetries = 20) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://portfolio.nguyendangtuongminh.com',
          'X-Title': 'Hachiware Portfolio Assistant',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite', // Use 2.0 lite as requested
          messages,
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      // Rate limited or overloaded — wait and retry
      if (response.status === 429 || response.status === 503 || response.status === 502) {
        const waitMs = Math.min(2000 * Math.pow(1.5, attempt), 10000);
        console.log(`[Chat] HTTP ${response.status} — retry ${attempt + 1}/${maxRetries} in ${Math.round(waitMs/1000)}s`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      const data = await response.json();

      // Rate limit in body
      if (data.error?.code === 429 ||
          (typeof data.error?.message === 'string' &&
           (data.error.message.toLowerCase().includes('rate') ||
            data.error.message.toLowerCase().includes('capacity') ||
            data.error.message.toLowerCase().includes('overload')))) {
        const waitMs = Math.min(2000 * Math.pow(1.5, attempt), 10000);
        console.log(`[Chat] Body rate-limit — retry ${attempt + 1}/${maxRetries} in ${Math.round(waitMs/1000)}s`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }

      // Empty response — try alternative free model on last few attempts
      if (attempt >= maxRetries - 3) {
        const fallbacks = [
          'google/gemma-3-4b-it:free',
          'mistralai/mistral-7b-instruct:free',
          'meta-llama/llama-3.2-3b-instruct:free',
        ];
        const fallbackIdx = maxRetries - attempt - 1;
        if (fallbackIdx >= 0 && fallbackIdx < fallbacks.length) {
          console.log(`[Chat] Trying fallback model: ${fallbacks[fallbackIdx]}`);
          const fb = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://portfolio.nguyendangtuongminh.com',
            },
            body: JSON.stringify({ model: fallbacks[fallbackIdx], messages, max_tokens: 600 }),
          }).then(r => r.json());
          if (fb.choices?.[0]?.message?.content) return fb.choices[0].message.content;
        }
      }

      // Unexpected empty — wait and retry
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.log(`[Chat] Network error attempt ${attempt + 1}: ${err.message}`);
      await new Promise(r => setTimeout(r, Math.min(1500 * (attempt + 1), 8000)));
    }
  }
  return null;
}

/** POST /api/chat */
exports.chat = async (req, res) => {
  try {
    const { message, history = [], lang = 'vi' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const cleanMessage = sanitizeUserInput(message);
    if (!cleanMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (hasSuspiciousPattern(cleanMessage)) {
      return res.json({
        reply: 'Yêu cầu này không hợp lệ vì chứa mẫu lệnh không an toàn. Bạn hãy hỏi lại theo nội dung portfolio.',
      });
    }

    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-openrouter-key-here') {
      return res.json({
        reply: 'Hachiware chưa được kết nối AI. Vui lòng thêm OpenRouter API key vào .env.',
      });
    }

    // ── Apply Rate Limit
    const ip = req.visitorInfo?.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const limitCheck = checkAndLimitChat(ip);
    if (!limitCheck.ok) {
      if (limitCheck.reason === 'global') {
        return res.json({
          reply: 'Hệ thống chat đã đạt giới hạn 30 lượt hôm nay. Vui lòng quay lại vào ngày mai.',
        });
      }
      return res.json({
        reply: 'Bạn đã trò chuyện đủ 6 lần hôm nay. Vui lòng quay lại vào ngày mai nhé.',
      });
    }

    // Build context from MongoDB
    const { profile, projects, research, certificates } = await chatService.loadChatContext();

    const systemPrompt = buildSystemPrompt(profile, projects, research, certificates, lang);

    let userContent = cleanMessage;
    const q = userContent.toLowerCase();
    if (/nghiên\s*cứu|nghien\s*cuu|research|công\s*trình|paper|kho\s*nghiên|đề\s*tài/i.test(q)) {
      const docs = await chatService.loadResearchSnippets(8);
      if (docs.length) {
        const snippets = docs.map((d) => {
          const body = (d.readme || d.description || '').slice(0, 900);
          return `${d.title}${d.subtitle ? ' — ' + d.subtitle : ''}\n${body}`;
        }).join('\n\n---\n\n');
        userContent += `\n\nTrích từ kho nghiên cứu (chỉ để trả lời):\n${snippets}`;
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...sanitizeHistory(history),
      { role: 'user', content: userContent },
    ];

    const reply = await callOpenRouter(messages);

    if (reply) {
      return res.json({ reply: sanitizeModelReply(reply) });
    }

    // All retries failed
    return res.json({
      reply: 'Hachiware đang quá tải. Bạn thử lại sau vài giây nhé.',
    });

  } catch (error) {
    console.error('[Chat] Unhandled error:', error.message);
    res.json({
      reply: 'Hachiware gặp sự cố kết nối. Bạn thử lại sau nhé.',
    });
  }
};
