/**
 * seed.js — Import all portfolio content + profile into MongoDB
 * 
 * Run once: node seed.js
 * Re-run safe: drops existing content and re-imports
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Content = require('./models/Content');
const Profile = require('./models/Profile');

const CERTS_DIR = path.resolve(__dirname, '../../Certificates');
const MARKDOWN_DIR = path.resolve(__dirname, '../../Markdown');
const UPLOADS_CERTS = path.join(__dirname, 'uploads/certificates');
const BRANDING_DIR = path.resolve(__dirname, '../../image');
const BRANDING_WARN_SIZE_BYTES = 12 * 1024 * 1024;

function readReadme(filename) {
  if (!filename) return '';
  const candidates = [
    path.join(MARKDOWN_DIR, filename),
    path.join(CERTS_DIR, filename),
  ];
  try {
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (err) {
    console.warn(`⚠️  Could not read ${filename}:`, err.message);
  }
  console.warn(`⚠️  Missing markdown README for seed: ${filename}`);
  return '';
}

function readCertImageIntoBuffer(basename) {
  if (!basename) return undefined;
  const candidates = [path.join(CERTS_DIR, basename), path.join(UPLOADS_CERTS, basename)];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch { /* */ }
  }
  const normalizeForMatch = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  const normBase = normalizeForMatch(basename);
  const fallbackDirs = [CERTS_DIR, UPLOADS_CERTS];
  const fallbackFiles = [];
  for (const dir of fallbackDirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir)) {
        if (/\.(png|jpe?g|webp)$/i.test(file)) {
          fallbackFiles.push(path.join(dir, file));
        }
      }
    } catch { /* */ }
  }
  let matchedPath = fallbackFiles.find((p) => normalizeForMatch(path.basename(p)) === normBase)
    || fallbackFiles.find((p) => normalizeForMatch(path.basename(p)).includes(normBase))
    || (normBase.includes('mindx') ? fallbackFiles.find((p) => normalizeForMatch(path.basename(p)).includes('mindx')) : undefined)
    || (normBase.includes('cole') ? fallbackFiles.find((p) => normalizeForMatch(path.basename(p)).includes('cole')) : undefined);
  if (matchedPath) {
    console.warn(`⚠️  Fallback matched certificate image for ${basename} -> ${path.basename(matchedPath)}`);
    return fs.readFileSync(matchedPath);
  }
  console.warn(`⚠️  Missing certificate image on disk for seed: ${basename}`);
  return undefined;
}

function readBrandingImageIntoBuffer(filename, variant) {
  if (!filename) return undefined;
  const imagePath = path.join(BRANDING_DIR, filename);
  try {
    if (fs.existsSync(imagePath)) {
      const buffer = fs.readFileSync(imagePath);
      const size = buffer.length;
      const sizeMb = (size / (1024 * 1024)).toFixed(2);
      console.log(`🖼️  Branding ${variant}: ${filename} (${sizeMb} MB)`);
      if (size > BRANDING_WARN_SIZE_BYTES) {
        console.warn(`⚠️  Branding ${variant} is large (${sizeMb} MB). Seed continues with this file.`);
      }
      return { buffer, size };
    }
  } catch { /* */ }
  console.warn(`⚠️  Missing branding image for seed (${variant}): ${filename}`);
  return undefined;
}

function mimeFromFilename(filename) {
  const lower = String(filename || '').toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

// ═══════════════════════════════════════════════
// PROFILE DATA (moved from client profile.js)
// ═══════════════════════════════════════════════
const profileData = {
  name: 'Nguyễn Đặng Tường Minh',
  subtitle: '15 tuổi · AI Researcher · Full-Stack Developer',
  email: 'nguyendangtuongminh555@gmail.com',
  phone: '0375157991',
  github: 'https://github.com/MinhNguyenR',
  location: 'Vũng Tàu, Việt Nam',

  lab: [
    'GPU: NVIDIA RTX 5080 — 16GB VRAM',
    'Memory: 64GB RAM',
    'Storage: NVMe Samsung 990 EVO',
  ],

  skills: {
    'Lập trình': ['Python (Chuyên sâu)', 'JavaScript/Node.js'],
    'Deep Learning': ['PyTorch', 'TensorFlow', 'HuggingFace Transformers', 'OpenCV'],
    'Tối ưu hóa': ['Model Quantization (4-bit, 1.58-bit)', 'KV Cache Management', 'CUDA 13.X'],
    'DevOps': ['Linux', 'Docker', 'Git/GitHub', 'RESTful API'],
    'Ngoại ngữ': ['Tiếng Anh (~5.5 IELTS)', 'Tiếng Đức (A1/A2)'],
  },

  timeline: [
    {
      date: '2022–2024',
      title: 'THCS Châu Thành',
      subtitle: 'TP. Vũng Tàu',
      description: 'Học THCS tại TP. Vũng Tàu từ lớp 6 đến lớp 8.',
      icon: '🏫',
      category: 'school',
      schoolSlug: 'thcs-chau-thanh',
    },
    {
      date: '2022.01',
      title: 'MindX Technology',
      subtitle: 'Trung tâm đào tạo — CS & Fullstack Web Development',
      description: 'Bắt đầu hành trình lập trình tại trung tâm MindX. Từ Game cơ bản đến kiến trúc Client-Server, tối ưu cấu trúc dữ liệu.',
      icon: '🖥️',
      category: 'course',
    },
    {
      date: '2024',
      title: 'Trường Sion North Wake Academy',
      subtitle: 'North Carolina, USA (Online)',
      description: 'Sau năm lớp 9 tại Việt Nam, rút học bạ chuyển sang chương trình THCS quốc tế online; học lại lớp 8 theo yêu cầu nhập học. Top 50 học sinh xuất sắc toàn trường — năm học lớp 9 tại Sion.',
      icon: '🌍',
      category: 'school',
      schoolSlug: 'sion-north-wake',
    },
    {
      date: '2024',
      title: 'BrightChamps',
      subtitle: 'Trung tâm đào tạo — AI & Deep Learning cơ bản',
      description: 'Học Computer Vision và Deep Learning cơ bản (6 tháng). Nền tảng để tiến vào chương trình AI Engineer chuyên sâu tại Cole AI Academy.',
      icon: '⚡',
      category: 'course',
    },
    {
      date: '2025.04',
      title: 'Hoàn thành chứng chỉ MindX',
      subtitle: 'Fullstack Web Dev — Xếp loại Giỏi',
      description: 'CS & Thuật toán: 9.2/10. Chứng chỉ nghề Fullstack Web Development.',
      icon: '🎓',
      category: 'achievement',
    },
    {
      date: '2025–nay',
      title: 'Cole AI Academy',
      subtitle: '2 khóa gộp: AIE + Bootcamp LLMOps & AgentOps',
      description: 'Theo học từ 2025 đến hiện tại với 2 khóa gộp trong một lộ trình: AI Engineer (AIE) và Bootcamp LLMOps & AgentOps.',
      icon: '🤖',
      category: 'course',
    },
    {
      date: '2025',
      title: 'Tree-Gated Transformer',
      subtitle: 'Hybrid Neuro-Symbolic Architecture',
      description: 'Bắt đầu nghiên cứu kiến trúc quản lý KV Cache 3 tầng cho LLM trên phần cứng hạn chế.',
      icon: '🧠',
      category: 'research',
    },
    {
      date: '2026',
      title: 'AI Team Blueprint v6.2',
      subtitle: '23 Agents, 70+ Models',
      description: 'Framework điều phối multi-agent với tự động routing, tiết kiệm 74-79% chi phí.',
      icon: '🤖',
      category: 'project',
    },
    {
      date: '2026',
      title: 'LATS Research',
      subtitle: '3-Tier Cognitive Architecture',
      description: 'Hệ thống huấn luyện AI đa tầng, giải quyết physical hallucination bằng Ternary Logic.',
      icon: '🧬',
      category: 'research',
    },
    {
      date: '2026',
      title: 'SuperChip Concept v1',
      subtitle: 'Consumer Supercomputer Chip',
      description: 'Thiết kế kiến trúc chip: 2 wafer stacking, NPU+Cache 1:1, 3-5GB on-chip cache.',
      icon: '🔬',
      category: 'research',
    },
    {
      date: '2026',
      title: 'Hybrid Memory Tiering',
      subtitle: 'Phục vụ 1M Users',
      description: 'Đề xuất kỹ thuật KV Cache 3 tầng + Shared Prefix Caching cho hệ thống phục vụ 1 triệu users.',
      icon: '⚡',
      category: 'research',
    },
    {
      date: '2026',
      title: 'Evo-Neural-OS (ENOS)',
      subtitle: 'Self-Evolving Neural OS',
      description: 'Hệ điều hành thần kinh tự tiến hóa: Hybrid Router, Gated Residual Bit-Width Evolution, Custom C Kernel GPU decompression.',
      icon: '🧪',
      category: 'research',
    },
  ],

  cv: {
    objective: 'Đại diện thế hệ Gen Z: đam mê, tự học, có khả năng phân tích và tổng hợp kiến thức từ các tài liệu học thuật (papers) hàng đầu. Tôi là Đặng Tường Minh, 15 tuổi, học sinh trung học song song với nghiên cứu AI và phát triển phần mềm. Tôi đã tự xây dựng AI Lab tại nhà (NVIDIA RTX 5080, 64GB RAM) để thử nghiệm các ý tưởng táo bạo. Định hướng lớn: Inference Optimization cho LLM trên phần cứng hạn chế.',
    highlights: [
      'Nhiều ý tưởng nghiên cứu về AI Architecture, caching đa tầng (Tree-Gated) và Multi-Agent systems; Tree-Gated Transformer và AI Team Blueprint là hai hướng đang triển khai tích cực.',
      'Là tác giả của tài khoản MinhNguyenR trên GitHub cùng với các mã nguồn trên đó.',
      'Hoàn thành xuất sắc và thuộc Top 50 học sinh giỏi tại trường quốc tế Sion (Sion North Wake Academy, Hoa Kỳ).',
      'Tốt nghiệp Xếp loại Giỏi tại MindX Technology School (Fullstack Web Development) và Brightchamps & Cole AI Academy (AI Engineer).',
      'Có kinh nghiệm làm việc độc lập với nhiều công cụ và ngôn ngữ: Python, JS/Node, C/C++, CUDA, PyTorch, LangChain.',
    ],
  },
};

const seedData = [
  // ═══════════════════════════════════════════════
  // RESEARCH (6 items)
  // ═══════════════════════════════════════════════
  {
    type: 'research',
    slug: 'tree-gated-transformer',
    title: 'Tree-Gated Transformer',
    subtitle: 'Hybrid Neuro-Symbolic Architecture',
    description: 'Kiến trúc kết hợp Random Forest/Decision Tree với Transformer để quản lý KV Cache thông minh qua 3 tầng bộ nhớ (VRAM → RAM → SSD). Giải quyết O(n²) complexity và Context Window limitation trên phần cứng 16GB VRAM.',
    readme: readReadme('readme_research_treegatedtransformer.md.md'),
    category: 'research',
    tags: ['Python', 'PyTorch', 'CUDA 13.X', 'XGBoost', 'Transformer'],
    github: 'https://github.com/MinhNguyenR/Tree-Gated-Transformer',
    icon: '🧠',
    featured: true,
    visible: true,
    contentLocked: true,
    order: 1,
    date: '2025',
  },
  {
    type: 'research',
    slug: 'ai-team-blueprint',
    title: 'AI Team Blueprint v6.2',
    subtitle: 'Multi-Agent LLM Orchestration Framework',
    description: 'Framework điều phối 23 AI agents chuyên biệt, tự động routing qua 4 tiers phức tạp, tích hợp 70+ models via OpenRouter. Tiết kiệm 74-79% chi phí so với sử dụng models cao cấp đơn lẻ.',
    readme: readReadme('readme_research_aiteam.md'),
    category: 'ai',
    tags: ['Python', 'LangGraph', 'OpenRouter', 'Textual', 'Rich'],
    github: 'https://github.com/MinhNguyenR/AITEAM',
    icon: '🤖',
    featured: true,
    visible: true,
    contentLocked: true,
    order: 2,
    date: '2026',
  },
  {
    type: 'research',
    slug: 'lats',
    title: 'LATS — Layered AI Training System',
    subtitle: '3-Tier Cognitive Architecture',
    description: 'Hệ thống huấn luyện AI đa tầng với cognitive architecture 3 cấp, giải quyết physical hallucination bằng Ternary Logic (True/False/Unknown). Kết hợp reasoning engine với knowledge graph validation.',
    readme: readReadme('readme_research_lats.md'),
    category: 'research',
    tags: ['Python', 'PyTorch', 'Knowledge Graphs', 'Ternary Logic'],
    icon: '🧬',
    featured: true,
    visible: true,
    contentLocked: true,
    order: 3,
    date: '2026',
  },
  {
    type: 'research',
    slug: 'superchip-concept-v1',
    title: 'SuperChip Concept v1',
    subtitle: 'Consumer Supercomputer Chip Architecture',
    description: 'Thiết kế kiến trúc chip siêu máy tính cho consumer market: 2 wafer stacking, NPU+Cache 1:1, 3-5GB on-chip cache, dedicated AI co-processor. Giảm latency 10x so với off-chip memory access.',
    readme: readReadme('readme_research_superchip_v1.md'),
    category: 'research',
    tags: ['Chip Design', 'Wafer Stacking', 'NPU', 'Cache Architecture'],
    icon: '🔬',
    visible: true,
    contentLocked: true,
    order: 4,
    date: '2026',
  },
  {
    type: 'research',
    slug: 'hybrid-memory-tiering',
    title: 'Hybrid Memory Tiering',
    subtitle: 'Technical Proposal — 1M Concurrent Users',
    description: 'Đề xuất kỹ thuật phục vụ 1.000.000 users đồng thời qua KV Cache 3 tầng + Tree-based optimization. Shared Prefix Caching, Super-Blocks management, Agentic Orchestration Backend.',
    readme: readReadme('readme_research_Hybridmemorytiering.md'),
    category: 'research',
    tags: ['System Design', 'KV Cache', 'PCIe', 'Distributed Systems'],
    icon: '⚡',
    visible: true,
    contentLocked: true,
    order: 5,
    date: '2026',
  },
  {
    type: 'research',
    slug: 'evo-neural-os',
    title: 'Evo-Neural-OS (ENOS)',
    subtitle: 'Self-Evolving Neural Operating System',
    description: 'Hệ điều hành thần kinh tự tiến hóa: Hybrid Router (Tree+Neural), Gated Residual Bit-Width Evolution, Custom C Kernel GPU decompression, Reasoning & Veto Layer. Implementation Ready.',
    readme: readReadme('readme_enos.md'),
    category: 'research',
    tags: ['C', 'CUDA', 'Python', 'Neural Architecture', 'Quantization'],
    icon: '🧪',
    visible: true,
    contentLocked: true,
    order: 6,
    date: '2026',
  },

  // ═══════════════════════════════════════════════
  // PROJECTS (8 items)
  // ═══════════════════════════════════════════════
  {
    type: 'project',
    slug: 'bartpho-vietnews',
    title: 'Bartpho_VietNews',
    subtitle: 'Vietnamese Text Summarization',
    description: 'Hệ thống tóm tắt văn bản tiếng Việt tự động bằng BARTpho fine-tuned trên VietNews. ROUGE-1: 85.2%, ROUGE-2: 72.8%. Demo qua Gradio interface.',
    readme: readReadme('readme_project_bartpho.md'),
    category: 'ai',
    tags: ['Python', 'PyTorch', 'HuggingFace', 'Gradio'],
    github: 'https://github.com/MinhNguyenR/Bartpho_Vietnews',
    icon: '📰',
    featured: true,
    order: 1,
    date: '2025',
  },
  {
    type: 'project',
    slug: 'phanloaiquanao',
    title: 'PhanLoaiQuanAo',
    subtitle: 'Fashion Image Classification',
    description: 'Phân loại quần áo tự động bằng CNN trên MNIST Fashion. Áp dụng Data Augmentation và Evaluation Pipeline.',
    readme: '# PhanLoaiQuanAo\n\n## Fashion Image Classification with CNN\n\nXây dựng và huấn luyện mạng nơ-ron tích chập (CNN) để phân loại trang phục tự động trên tập dữ liệu MNIST Fashion.\n\n### Kỹ thuật\n- Convolutional Neural Network (CNN)\n- Data Augmentation\n- Evaluation Pipeline\n- TensorFlow / OpenCV\n\n### Dataset\nMNIST Fashion — 70,000 images, 10 categories\n\n### Tech Stack\n- Python\n- TensorFlow\n- OpenCV\n- NumPy, Matplotlib',
    category: 'ai',
    tags: ['Python', 'TensorFlow', 'OpenCV', 'CNN'],
    github: 'https://github.com/MinhNguyenR/PhanLoaiQuanAo',
    icon: '👕',
    featured: true,
    order: 2,
    date: '2025',
  },
  {
    type: 'project',
    slug: 'hrmanagement',
    title: 'HRManagement',
    subtitle: 'Full-Stack HR System',
    description: 'Hệ thống quản lý nhân sự full-stack: JWT auth, chấm công, nghỉ phép, đánh giá hiệu suất, lương thưởng, tuyển dụng, hợp đồng. Real-time notifications qua Socket.IO.',
    readme: readReadme('readme_hrmanagement.md'),
    category: 'fullstack',
    tags: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'Cloudinary'],
    github: 'https://github.com/MinhNguyenR/HRManagement',
    icon: '👥',
    featured: true,
    order: 3,
    date: '2024',
  },
  {
    type: 'project',
    slug: 'sellcars-autohunt',
    title: 'Sellcars (Autohunt)',
    subtitle: 'Car Marketplace Platform',
    description: 'Nền tảng mua bán xe hơi trực tuyến với admin dashboard, search/filter nâng cao, responsive design.',
    readme: readReadme('readme_autohunt.md'),
    category: 'web',
    tags: ['React', 'Vite', 'Tailwind', 'Ant Design'],
    github: 'https://github.com/MinhNguyenR/Sellcars',
    icon: '🚗',
    order: 4,
    date: '2024',
  },
  {
    type: 'project',
    slug: 'socialmedia',
    title: 'SocialMedia',
    subtitle: 'Social Media Platform',
    description: 'Nền tảng mạng xã hội với tính năng đăng bài, like, comment, follow, real-time chat.',
    readme: '# SocialMedia\n\n## Social Media Platform\n\nNền tảng mạng xã hội hoàn chỉnh với các tính năng:\n\n### Features\n- 📝 Đăng bài viết (text, ảnh)\n- ❤️ Like / Unlike\n- 💬 Comment system\n- 👥 Follow / Unfollow\n- 🔔 Notifications\n- 💬 Real-time chat\n\n### Tech Stack\n- JavaScript\n- React\n- Node.js\n- MongoDB',
    category: 'web',
    tags: ['JavaScript', 'React', 'Node.js'],
    github: 'https://github.com/MinhNguyenR/SocialMedia',
    icon: '💬',
    order: 5,
    date: '2024',
  },
  {
    type: 'project',
    slug: 'todolist',
    title: 'Todolist',
    subtitle: 'Task Management App',
    description: 'Ứng dụng quản lý công việc với CRUD operations, localStorage, responsive UI.',
    readme: '# Todolist\n\n## Task Management Application\n\nỨng dụng quản lý công việc đơn giản nhưng hiệu quả.\n\n### Features\n- ✅ Thêm / Sửa / Xóa task\n- 📋 Filter: All / Active / Completed\n- 💾 LocalStorage persistence\n- 📱 Responsive design\n\n### Tech Stack\n- JavaScript (Vanilla)\n- HTML5 / CSS3',
    category: 'web',
    tags: ['JavaScript', 'HTML', 'CSS'],
    github: 'https://github.com/MinhNguyenR/Todolist',
    icon: '✅',
    order: 6,
    date: '2024',
  },

  // ═══════════════════════════════════════════════
  // CERTIFICATES (2 real + 1 coming soon)
  // ═══════════════════════════════════════════════
  {
    type: 'certificate',
    slug: 'mindx-fullstack',
    title: 'Fullstack Web Development',
    subtitle: 'Trung tâm MindX Technology',
    description: 'Chứng chỉ nghề Fullstack Web Development — Xếp loại Giỏi. Computer Science & Thuật toán: 9.2/10.',
    readme: '# Chứng chỉ Fullstack Web Development\n\n## Trung tâm MindX Technology\n\n**Thời gian đào tạo:** 01/2022 – 08/2025\n\n### Nội dung\n- Computer Science & Thuật toán: **9.2/10**\n- Fullstack Web Development: **Xếp loại Giỏi**\n- Lập trình Game cơ bản\n- Kiến trúc Client-Server\n- Cấu trúc dữ liệu & Thuật toán\n- RESTful API & Database\n\n### Kỹ năng tích lũy\n- JavaScript / Node.js\n- React.js\n- MongoDB\n- Express.js\n- HTML5 / CSS3',
    category: 'education',
    tags: ['Web Development', 'CS', 'JavaScript'],
    certificateImageName: 'mindx.jpg',
    certificateImageMime: 'image/jpeg',
    file: '/api/content/certificate-image/mindx-fullstack',
    icon: '📜',
    featured: true,
    order: 1,
    date: '2025',
  },
  {
    type: 'certificate',
    slug: 'cole-ai-engineer',
    title: 'AI Engineer Certificate',
    subtitle: 'Trung tâm Brightchamps & Cole',
    description: 'Chứng chỉ AI Engineer — Deep Learning & NLP. 10 tháng đào tạo chuyên sâu về Computer Vision, Deep Learning, và NLP.',
    readme: '# AI Engineer Certificate\n\n## Trung tâm Brightchamps & Cole Academy\n\n**Thời gian đào tạo:** 10 tháng\n\n### Nội dung\n- Computer Vision fundamentals\n- Deep Learning (CNN, RNN, Transformer)\n- Natural Language Processing (NLP)\n- Model Training & Evaluation\n- PyTorch / TensorFlow\n\n### Kỹ năng tích lũy\n- PyTorch\n- TensorFlow\n- HuggingFace Transformers\n- OpenCV\n- Data Augmentation',
    category: 'education',
    tags: ['AI', 'Deep Learning', 'NLP'],
    certificateImageName: 'cole.jpg',
    certificateImageMime: 'image/jpeg',
    file: '/api/content/certificate-image/cole-ai-engineer',
    icon: '🎓',
    featured: true,
    order: 2,
    date: '2026',
  },


  // ═══════════════════════════════════════════════
  // INTRODUCTION LETTERS
  // ═══════════════════════════════════════════════
  {
    type: 'letter',
    slug: 'coming-soon',
    title: 'Introduction Letters',
    subtitle: 'Coming Soon',
    description: 'Thư giới thiệu sẽ được cập nhật khi hoàn thành.',
    icon: '🔐',
    visible: true,
    featured: true,
    order: 1,
    date: '—',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing content
    await Content.deleteMany({});
    console.log('🗑️  Cleared existing content');

    const seedDataWithCerts = seedData.map((item) => {
      if (item.type !== 'certificate' || !item.certificateImageName) return item;
      const certificateImage = readCertImageIntoBuffer(item.certificateImageName);
      if (!certificateImage) return item;
      return {
        ...item,
        certificateImage,
        certificateImageProvider: 'db',
        certificateImageCloudinaryUrl: '',
        certificateImageCloudinaryPublicId: '',
      };
    });

    const result = await Content.insertMany(seedDataWithCerts);
    console.log(`✅ Seeded ${result.length} content items:`);

    // Summary
    const types = {};
    result.forEach((item) => {
      types[item.type] = (types[item.type] || 0) + 1;
    });
    Object.entries(types).forEach(([type, count]) => {
      console.log(`   📦 ${type}: ${count}`);
    });

    // Seed or update profile
    const darkBrandingFilename = '9bb085d44b3328e4722f2acdd908fd35.jpg';
    const lightBrandingFilename = 'wp13481038.png';
    const brandingDark = readBrandingImageIntoBuffer(darkBrandingFilename, 'dark');
    const brandingLight = readBrandingImageIntoBuffer(lightBrandingFilename, 'light');
    const profilePayload = {
      ...profileData,
      ...(brandingDark
        ? {
            brandingHachiDark: brandingDark.buffer,
            brandingHachiDarkMime: mimeFromFilename(darkBrandingFilename),
            brandingHachiDarkSize: brandingDark.size,
          }
        : {}),
      ...(brandingLight
        ? {
            brandingHachiLight: brandingLight.buffer,
            brandingHachiLightMime: mimeFromFilename(lightBrandingFilename),
            brandingHachiLightSize: brandingLight.size,
          }
        : {}),
    };
    await Profile.deleteMany({});
    await Profile.create(profilePayload);
    console.log('✅ Seeded profile data');

    await mongoose.disconnect();
    console.log('\n✅ Seed completed!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
