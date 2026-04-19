import { useState, useRef } from 'react';
import { Send, Mail, MapPin, GitFork, Cpu, Phone } from 'lucide-react';
import api from '../../utils/api';
import { useTheme } from '../Theme/ThemeProvider';

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isHachiware } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
      return;
    }
    setLoading(true);
    try {
      // Include fingerprint to link visitor
      const fp = localStorage.getItem('visitor_fp') || '';
      const res = await api.post('/contact', { ...form, fingerprint: fp });

      setStatus({ type: 'success', text: 'Tin nhắn đã gửi thành công! 🎉' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    }
    setLoading(false);
  };

  return (
    <div className="section" data-section="contact">
      <div className="section-header">
        <h2 className="section-title">{isHachiware ? '🐱 ' : ''}Liên Hệ</h2>
        <p className="section-subtitle">Gửi tin nhắn cho tôi</p>
      </div>

      {status && (
        <div className={`alert alert-${status.type}`}>{status.text}</div>
      )}

      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tên của bạn"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Tùy chọn"
            />
          </div>
          <div className="form-group">
            <label>Tin nhắn *</label>
            <textarea
              className="form-textarea"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Nội dung tin nhắn..."
            />
          </div>
          <button type="submit" className="btn btn-primary form-submit" disabled={loading}>
            <Send size={16} />
            {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </button>
        </form>

        <div className="contact-info">
          <div className="contact-info-card">
            <div className="contact-info-icon"><Mail size={20} /></div>
            <div>
              <div className="contact-info-label">Email</div>
              <div className="contact-info-value">nguyendangtuongminh555@gmail.com</div>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><Phone size={20} /></div>
            <div>
              <div className="contact-info-label">Số điện thoại</div>
              <div className="contact-info-value">0375157991</div>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><MapPin size={20} /></div>
            <div>
              <div className="contact-info-label">Vị trí</div>
              <div className="contact-info-value">Vũng Tàu, Việt Nam</div>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon"><GitFork size={20} /></div>
            <div>
              <div className="contact-info-label">GitHub</div>
              <a href="https://github.com/MinhNguyenR" target="_blank" rel="noopener noreferrer" className="contact-info-value">
                MinhNguyenR
              </a>
            </div>
          </div>

          <div className="contact-info-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="var(--ocean-sky)" />
              <span style={{ fontWeight: 600, color: 'var(--white)' }}>AI Lab Setup</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ocean-pale)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>• GPU: NVIDIA RTX 5080 — 16GB VRAM</span>
              <span>• Memory: 64GB RAM</span>
              <span>• Storage: NVMe Samsung 990 EVO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSection;
