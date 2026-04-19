import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Award, Users, BookOpen, Star, MapPin, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

// ─── Component ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function SchoolPage() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lang, t, getLocalized } = useLanguage();

  useEffect(() => {
    import('../utils/api').then(({ default: api }) => {
      api.get(`/content/any/${slug}`)
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    });
  }, [slug]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('load_more')}</div>;
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '4rem' }}>🔍</span>
        <h2>{lang === 'vi' ? 'Không tìm thấy trang này' : 'Page not found'}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>{t('back_to_home')}</button>
      </div>
    );
  }

  const title = getLocalized(data, 'title');
  const subtitle = getLocalized(data, 'subtitle');
  const description = getLocalized(data, 'description');
  
  const isSchool = data.type === 'school';
  const meta = (lang === 'vi' ? data.meta : data.translations?.[lang]?.meta) || data.meta || {};
  
  const stats = meta.stats || [];
  const highlights = meta.highlights || [];
  const programs = meta.programs || [];
  const myJourney = meta.myJourney || { period: '', grade: '', achievement: '', note: '', subjects: [] };
  const accentColor = meta.accentColor || '#3b82f6';
  const accent = meta.accent || `linear-gradient(135deg, ${accentColor}, #000)`;

  return (
    <div className="school-page">
      <motion.button
        className="school-back-btn"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft size={18} /> {lang === 'vi' ? 'Quay lại' : 'Back'}
      </motion.button>

      {/* Hero Banner */}
      <motion.div
        className="school-hero"
        style={{ background: accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="school-hero-inner">
          <motion.div className="school-logo" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            {data.icon || '🏫'}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="school-type-badge">{isSchool ? '🏫 International School' : '🎓 Training Center'}</span>
            <h1 className="school-hero-title">{title}</h1>
            <p className="school-hero-tagline">{subtitle}</p>
            <div className="school-hero-meta">
              <span><MapPin size={14} /> {meta.location || ''}</span>
              <span><Calendar size={14} /> Est. {meta.established || ''}</span>
              {meta.website && <a href={meta.website} target="_blank" rel="noopener noreferrer"><Globe size={14} /> Website</a>}
            </div>
          </motion.div>
        </div>
        <div className="school-stats-row">
          {stats.map((s, i) => (
            <motion.div key={i} className="school-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
              <div className="school-stat-value">{s.value}</div>
              <div className="school-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div className="school-content">
        <motion.div className="school-grid" variants={stagger} initial="hidden" animate="show">

          <motion.div className="school-card school-card-wide" variants={fadeUp}>
            <h2><BookOpen size={20} /> {lang === 'vi' ? 'Giới thiệu' : 'Introduction'}</h2>
            {(description || '').split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: '1rem', color: 'var(--ocean-pale)', lineHeight: 1.75 }}>{para}</p>
            ))}
          </motion.div>

          <motion.div className="school-card school-journey-card" variants={fadeUp} style={{ borderColor: accentColor + '55' }}>
            <h2><Star size={20} style={{ color: accentColor }} /> {lang === 'vi' ? 'Hành trình của tôi' : 'My journey'}</h2>
            <div className="journey-detail">
              <div className="journey-row"><span className="journey-label">{lang === 'vi' ? 'Thời gian' : 'Period'}</span><span className="journey-value">{myJourney.period}</span></div>
              <div className="journey-row"><span className="journey-label">{lang === 'vi' ? 'Chương trình' : 'Program'}</span><span className="journey-value">{myJourney.grade}</span></div>
              <div className="journey-row"><span className="journey-label">{lang === 'vi' ? 'Thành tích' : 'Achievement'}</span><span className="journey-value" style={{ color: accentColor }}>{myJourney.achievement}</span></div>
            </div>
            <p style={{ color: 'var(--ocean-pale)', lineHeight: 1.7, marginTop: '1rem', fontSize: '0.9rem' }}>{myJourney.note}</p>
            <div className="school-inner-frame" style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ocean-light)', marginBottom: '0.5rem' }}>{lang === 'vi' ? 'Môn học / Kỹ năng' : 'Subjects / Skills'}</div>
              <div className="card-tags">{(myJourney.subjects || []).map(s => <span key={s} className="card-tag">{s}</span>)}</div>
            </div>
          </motion.div>

          <motion.div className="school-card" variants={fadeUp}>
            <h2><Award size={20} /> {lang === 'vi' ? 'Điểm nổi bật' : 'Key highlights'}</h2>
            <div className="school-highlights">
              {highlights.map((h, i) => (
                <div key={i} className="school-highlight-item">
                  <span className="school-highlight-icon">{h.icon}</span>
                  <div>
                    <div className="school-highlight-title">{h.title}</div>
                    <div className="school-highlight-desc">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="school-card" variants={fadeUp}>
            <h2><Users size={20} /> {lang === 'vi' ? 'Chương trình đào tạo' : 'Programs'}</h2>
            <ul className="school-programs">
              {programs.map((p, i) => (
                <li key={i}><span style={{ color: accentColor, marginRight: 8 }}>▸</span>{p}</li>
              ))}
            </ul>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

export default SchoolPage;
