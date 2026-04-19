require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const Content = require('../models/Content');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  let profile = await Profile.findOne();
  if (!profile) profile = new Profile();

  // Add the new skills requested by user
  // "database mongodb(atlas), sqlite devops Vercel, Render, Railway tool Postman, bruno chạy AI local với LM studio và ollama và dùng ide antigravity, cursor, trae, visual studio, visual studio code"
  const currentSkills = profile.skills || {};
  
  const updatedDatabases = [...new Set([...(currentSkills.Databases || []), 'MongoDB (Atlas)', 'SQLite'])];
  const updatedDevOps = [...new Set([...(currentSkills['DevOps & Deploy'] || []), 'Vercel', 'Render', 'Railway'])];
  const updatedTools = [...new Set([...(currentSkills.Tools || []), 'Postman', 'Bruno'])];
  const updatedAILocal = [...new Set([...(currentSkills['Local AI'] || []), 'LM Studio', 'Ollama'])];
  const updatedIDEs = [...new Set([...(currentSkills.IDEs || []), 'Antigravity', 'Cursor', 'Trae', 'Visual Studio', 'Visual Studio Code'])];

  profile.skills = {
    ...currentSkills,
    Databases: updatedDatabases,
    'DevOps & Deploy': updatedDevOps,
    Tools: updatedTools,
    'Local AI': updatedAILocal,
    IDEs: updatedIDEs,
  };

  profile.markModified('skills');
  await profile.save();
  console.log('✅ Updated Profile Skills');

  // Migrate SCHOOL_DATA to Content models
  const SCHOOL_DATA = {
    'thcs-chau-thanh': {
      type: 'school',
      name: 'THCS Châu Thành',
      logo: '🏫',
      location: 'TP. Vũng Tàu, Việt Nam',
      established: '—',
      website: null,
      tagline: 'Nền tảng THCS địa phương',
      accent: 'linear-gradient(135deg, #0f766e, #14b8a6)',
      accentColor: '#14b8a6',
      description: `Trường THCS Châu Thành tại TP. Vũng Tàu là một phần của hệ thống giáo dục phổ thông cơ sở Việt Nam. Chương trình theo khung Bộ GD&ĐT...`,
      highlights: [
        { icon: '📖', title: 'Chương trình Bộ GD&ĐT', desc: 'Khung chuẩn THCS Việt Nam' },
      ],
      programs: ['Chương trình THCS theo khung Việt Nam'],
      myJourney: { period: '2022 — 2024', grade: 'THCS (cấp hai)', achievement: 'Hoàn thành lớp 6 đến lớp 8', note: 'Tại VN', subjects: ['Toán'] },
      stats: [{ value: 'THCS', label: 'Cấp học' }],
    },
    'sion-north-wake': {
      type: 'school',
      name: 'Sion North Wake Academy',
      logo: '🌍',
      location: 'North Carolina, USA (Online)',
      established: '2003',
      website: 'https://sionnorthwake.org',
      tagline: 'Excellence in International Education',
      accent: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      accentColor: '#3b82f6',
      description: `Sion North Wake Academy là trường trung học tư thục quốc tế...`,
      highlights: [{ icon: '🏅', title: 'Kiểm định quốc tế', desc: 'AdvancED/Cognia' }],
      programs: ['K-8: Elementary & Middle School Program'],
      myJourney: { period: '2024 — Nay', grade: 'Grade 8 → Grade 9', achievement: 'Top 50', note: 'Học online', subjects: ['Mathematics'] },
      stats: [{ value: 'K-12', label: 'Cấp học' }],
    },
    'mindx': {
      type: 'course',
      name: 'MindX Technology School',
      logo: '🖥️',
      location: 'Vũng Tàu, Việt Nam',
      established: '2015',
      website: 'https://mindx.edu.vn',
      tagline: 'Nơi công nghệ gặp đam mê',
      accent: 'linear-gradient(135deg, #065f46, #10b981)',
      accentColor: '#10b981',
      description: `MindX Technology School (tiền thân là iSchool) là hệ thống đào tạo công nghệ...`,
      highlights: [{ icon: '💻', title: 'Project-Based Learning', desc: 'Học qua dự án thực tế' }],
      programs: ['CS Fundamentals & Thuật toán'],
      myJourney: { period: '01/2022 — 08/2025', grade: 'Fullstack Web Development', achievement: '9.2/10', note: 'Tại VN', subjects: ['JavaScript'] },
      stats: [{ value: '3.5 năm', label: 'Thời gian' }],
      certificate: { name: 'Chứng chỉ Fullstack Web Development', file: '/api/content/certificate-image/mindx-fullstack', slug: 'mindx-fullstack' }
    },
    'brightchamps': {
      type: 'course',
      name: 'BrightChamps',
      logo: '⚡',
      location: 'Online',
      established: '2020',
      website: 'https://brightchamps.com',
      tagline: 'Live 1:1 coding & STEM for kids & teens',
      accent: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
      accentColor: '#7c3aed',
      description: `BrightChamps là nền tảng EdTech quốc tế chuyên về STEM...`,
      highlights: [{ icon: '🌍', title: '30+ quốc gia', desc: 'Cộng đồng học viên K-12 toàn cầu' }],
      programs: ['Scratch & Block Coding (Beginners)'],
      myJourney: { period: '2024', grade: 'AI & Deep Learning Track', achievement: 'Hoàn thành chương trình', note: 'Học phần Computer Vision', subjects: ['Python'] },
      stats: [{ value: '6 tháng', label: 'Thời gian' }],
    },
    'cole': {
      type: 'course',
      name: 'Cole AI Academy',
      logo: '🤖',
      location: 'Online',
      established: '2021',
      website: 'https://cole.ai',
      tagline: '2 khóa gộp: AIE + LLMOps + AgentOps',
      accent: 'linear-gradient(135deg, #7c3aed, #db2777)',
      accentColor: '#a78bfa',
      description: `Cole AI Academy là trung tâm đào tạo AI chuyên sâu...`,
      highlights: [{ icon: '🧠', title: 'Deep Learning Chuyên sâu', desc: 'CNN, RNN, Transformer' }],
      programs: ['Neural Networks'],
      myJourney: { period: '2025 — Nay', grade: '2 khóa', achievement: 'AI Engineer Certificate', note: 'Theo học từ 2025', subjects: ['PyTorch'] },
      stats: [{ value: 'Ongoing', label: 'Thời gian' }],
      certificate: { name: 'AI Engineer Certificate', file: '/api/content/certificate-image/cole-ai-engineer', slug: 'cole-ai-engineer' }
    }
  };

  for (const [slug, data] of Object.entries(SCHOOL_DATA)) {
    const { type, name, logo, tagline, description, ...meta } = data;
    await Content.findOneAndUpdate(
      { slug },
      {
        type,
        slug,
        title: name,
        subtitle: tagline,
        icon: logo,
        description,
        meta,
        visible: true
      },
      { upsert: true }
    );
    console.log(`✅ Upserted ${type}: ${slug}`);
  }

  process.exit(0);
}

run();
