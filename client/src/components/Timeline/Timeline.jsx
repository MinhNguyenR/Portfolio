import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useTheme } from '../Theme/ThemeProvider';
import { useLanguage } from '../../hooks/useLanguage';

const hachiwareIcons = ['🐱', '😺', '😸', '😻', '😽', '🙀', '😹', '😼', '😾', '🐈'];

function Timeline() {
  const [timeline, setTimeline] = useState([]);
  const { isHachiware } = useTheme();
  const navigate = useNavigate();
  const { lang, t, getLocalized } = useLanguage();

  useEffect(() => {
    api.get('/profile')
      .then(res => {
        if (res.data?.timeline) setTimeline(res.data.timeline);
      })
      .catch(() => {});
  }, []);

  if (timeline.length === 0) return null;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  };

  const handleCardClick = (entry) => {
    if (entry.category === 'school') {
      navigate(`/school/${entry.schoolSlug || 'sion-north-wake'}`);
    } else if (entry.category === 'course') {
      const tVal = entry.title.toLowerCase();
      const slug = tVal.includes('mindx')       ? 'mindx'
                 : tVal.includes('brightchamps') ? 'brightchamps'
                 : tVal.includes('cole')         ? 'cole'
                 : null;
      if (slug) navigate(`/school/${slug}`);
    } else if (entry.category === 'research') {
      navigate('/vault/research');
    } else if (entry.category === 'project') {
      navigate('/vault/project');
    } else if (entry.category === 'achievement') {
      navigate('/vault/certificate');
    }
  };

  const orderedTimeline = [...timeline].sort((a, b) => {
    const aPin = String(a?.schoolSlug || '').toLowerCase() === 'thcs-chau-thanh' ? -1 : 0;
    const bPin = String(b?.schoolSlug || '').toLowerCase() === 'thcs-chau-thanh' ? -1 : 0;
    if (aPin !== bPin) return aPin - bPin;
    return 0;
  });

  return (
    <div className="section" data-section="timeline">
      <div className="section-header">
        <h2 className="section-title">Timeline</h2>
        <p className="section-subtitle">{lang === 'vi' ? 'Hành trình học tập và nghiên cứu' : lang === 'en' ? 'Education & Research Journey' : 'Bildungs- und Forschungsweg'}</p>
      </div>

      <motion.div
        className="timeline-container"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, margin: '-60px' }}
      >
        <div className="timeline-line" />

        {orderedTimeline.map((entry, i) => {
          const isClickable = ['school', 'course', 'research', 'project', 'achievement'].includes(entry.category);
          
          const title = getLocalized(entry, 'title');
          const subtitle = getLocalized(entry, 'subtitle');
          const description = getLocalized(entry, 'description');

          return (
            <motion.div
              key={entry._id || i}
              className="timeline-item"
              variants={item}
            >
              <div className="timeline-dot" />
              <motion.div
                className={`timeline-card ${isClickable ? 'timeline-card-clickable' : ''}`}
                onClick={() => isClickable && handleCardClick(entry)}
                whileHover={isClickable ? { scale: 1.02, y: -3 } : {}}
                whileTap={isClickable ? { scale: 0.98 } : {}}
              >
                <div className="timeline-header-row">
                  <div className="timeline-icon">
                    {isHachiware ? hachiwareIcons[i % hachiwareIcons.length] : entry.icon}
                  </div>
                  <div className="timeline-date">{entry.date}</div>
                </div>
                <h4 className="timeline-card-title">{title}</h4>
                <p className="timeline-card-subtitle">{subtitle}</p>
                <p className="timeline-card-desc">{description}</p>
                <div className="timeline-footer-row">
                  {entry.category && (
                    <span className={`timeline-badge timeline-badge-${entry.category}`}>
                      {entry.category === 'school' ? (lang === 'vi' ? '🏫 Trường' : '🏫 School') :
                       entry.category === 'course' ? (lang === 'vi' ? '📚 Khóa học' : '📚 Course') :
                       entry.category === 'research' ? (lang === 'vi' ? '🔬 Nghiên cứu' : '🔬 Research') :
                       entry.category === 'achievement' ? (lang === 'vi' ? '🏆 Thành tích' : '🏆 Achievement') :
                       (lang === 'vi' ? '💼 Dự án' : '💼 Project')}
                    </span>
                  )}
                  {isClickable && (
                    <span className="timeline-view-more">{lang === 'vi' ? 'Xem thêm →' : 'View more →'}</span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default Timeline;
