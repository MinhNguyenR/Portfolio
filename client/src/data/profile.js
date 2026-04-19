// Fallback profile data — Primary source is now MongoDB via /api/profile
// This file is used as fallback if API is unavailable
export const certificates = [
  {
    id: 'mindx',
    title: 'Fullstack Web Development',
    issuer: 'MindX Technology',
    date: '2026',
    visible: true,
    slug: 'mindx-fullstack',
    file: '/api/content/certificate-image/mindx-fullstack',
  },
  {
    id: 'cole',
    title: 'AI Engineer Certificate',
    issuer: 'Brightchamps & Cole',
    date: '2025',
    visible: true,
    slug: 'cole-ai-engineer',
    file: '/api/content/certificate-image/cole-ai-engineer',
  },
];

export const profileData = {
  name: 'Nguyễn Đặng Tường Minh',
  subtitle: '15 tuổi · AI Researcher · Full-Stack Developer',
  email: 'nguyendangtuongminh555@gmail.com',
  phone: '0375157991',
  github: 'https://github.com/MinhNguyenR',
  location: 'Vũng Tàu, Việt Nam',

  stats: [
    { value: '6', label: 'Research' },
    { value: '8+', label: 'Projects' },
    { value: '2', label: 'Certificates' },
    { value: '2', label: 'School' },
    { value: '3', label: 'Courses' },
  ],

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
      description: 'Học phổ thông cơ sở THCS tại TP. Vũng Tàu — lớp 6 đến lớp 8.',
      icon: '🏫',
      category: 'school',
      schoolSlug: 'thcs-chau-thanh',
    },
    {
      date: '2022.01',
      title: 'MindX Technology',
      subtitle: 'Trung tâm đào tạo — CS & Fullstack Web Development',
      description: 'Bắt đầu hành trình lập trình tại trung tâm MindX.',
      icon: '🖥️',
      category: 'course',
    },
    {
      date: '2024',
      title: 'Sion North Wake Academy',
      subtitle: 'North Carolina, USA (Online)',
      description: 'Sau năm lớp 9 tại VN, rút học bạ chuyển sang chương trình quốc tế online; học lại lớp 8 rồi lên lớp 9. Top 50 học sinh xuất sắc — năm lớp 9.',
      icon: '🌍',
      category: 'school',
      schoolSlug: 'sion-north-wake',
    },
    {
      date: '2025 — Nay',
      title: 'Brightchamps & Cole AI Academy',
      subtitle: 'Trung tâm đào tạo — 2 khóa gộp: AIE + LLMOps/AgentOps',
      description: 'Theo học từ 2025 đến hiện tại với 2 khóa gộp trong một lộ trình: AI Engineer (AIE) và bootcamp LLMOps + AgentOps.',
      icon: '🤖',
      category: 'course',
    },
  ],

  cv: {
    objective: 'Đại diện thế hệ Gen Z: đam mê, tự học, có khả năng phân tích và tổng hợp kiến thức từ papers hàng đầu. Mục tiêu: Inference Optimization cho LLM trên phần cứng hạn chế.',
    highlights: [
      'Nhiều ý tưởng nghiên cứu về AI Architecture, Tree-Gated caching và Multi-Agent; Tree-Gated Transformer và AI Team Blueprint đang triển khai tích cực.',
      'Là tác giả của tài khoản MinhNguyenR trên GitHub cùng với các mã nguồn trên đó.',
      'Top 50 học sinh giỏi — Sion North Wake Academy (Hoa Kỳ).',
      'Tốt nghiệp Giỏi MindX (Fullstack Web) và Brightchamps & Cole (AI Engineer).',
      'Python, JS/Node, C/C++, CUDA, PyTorch, LangChain.',
      'AI Lab: RTX 5080, 64GB RAM, NVMe.',
    ],
  },
};
