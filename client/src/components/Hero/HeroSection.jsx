import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { GitFork, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../Theme/ThemeProvider';
import api from '../../utils/api';
import CoursesModal from '../common/CoursesModal';
import SchoolsModal from '../common/SchoolsModal';

import { useLanguage } from '../../hooks/useLanguage';

function HeroSection() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [showCourses, setShowCourses] = useState(false);
  const [showSchools, setShowSchools] = useState(false);
  const { isHachiware } = useTheme();
  const { lang, t, getLocalized } = useLanguage();

  useEffect(() => {
    api.get('/profile')
      .then(res => {
        setProfile(res.data);
        setStats(res.data.dynamicStats);
      })
      .catch(() => {});
  }, []);

  const name     = getLocalized(profile, 'name') || 'Nguyễn Đặng Tường Minh';
  const subtitle = getLocalized(profile, 'subtitle') || (lang === 'vi' ? '15 tuổi · AI Researcher · Full-Stack Developer' : '15 years old · AI Researcher · Full-Stack Developer');

  const statItems = stats ? [
    { value: stats.research,     label: t('nav_research'),   route: '/vault/research',         emoji: '🔬' },
    { value: stats.projects,     label: t('nav_projects'),   route: '/vault/project',          emoji: '💼' },
    { value: stats.certificates, label: t('nav_certificates'), route: '/vault/certificate',      emoji: '🏆' },
    { value: stats.schools,      label: lang === 'vi' ? 'Trường học' : 'Schools',     schools: true,                    emoji: '🌍' },
    { value: stats.courses,      label: lang === 'vi' ? 'Khóa học' : 'Courses',    courses: true,                    emoji: '📚' },
  ] : [
    { value: '6',  label: t('nav_research'),   route: '/vault/research',         emoji: '🔬' },
    { value: '8+', label: t('nav_projects'),   route: '/vault/project',          emoji: '💼' },
    { value: '2',  label: t('nav_certificates'), route: '/vault/certificate',      emoji: '🏆' },
    { value: '2',  label: lang === 'vi' ? 'Trường học' : 'Schools',     schools: true,                    emoji: '🌍' },
    { value: '3',  label: lang === 'vi' ? 'Khóa học' : 'Courses',    courses: true,                    emoji: '📚' },
  ];

  const handleStatClick = (stat) => {
    if (stat.courses) {
      setShowCourses(true);
    } else if (stat.schools) {
      setShowSchools(true);
    } else if (stat.route) {
      navigate(stat.route);
    } else if (stat.scroll) {
      document.querySelector(`[data-section="${stat.scroll}"]`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="hero-section" data-section="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-avatar-container">
            <motion.img
              src="/images/avatar.png"
              alt="Avatar"
              className="hero-avatar"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            />
          </div>

          <motion.h1 className="hero-name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            {name}
          </motion.h1>

          <motion.p className="hero-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {subtitle}
          </motion.p>

          <motion.div className="hero-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            {statItems.map((stat, i) => (
              <motion.div
                key={i}
                className="hero-stat hero-stat-clickable"
                onClick={() => handleStatClick(stat)}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                title={stat.courses ? 'Xem trung tâm đào tạo' : stat.schools ? 'Xem trường học' : `Xem ${stat.label}`}
              >
                <div className="hero-stat-number">
                  {isHachiware ? '🐱' : stat.emoji} {stat.value}
                </div>
                <div className="hero-stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="hero-buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <Link to="/vault/project" className="btn btn-primary">
              {isHachiware ? '🐱 ' : ''}{t('hero_cta_projects')}
            </Link>
            <a href="https://github.com/MinhNguyenR" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <GitFork size={18} /> GitHub
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ marginTop: '3rem' }}>
            <ChevronDown
              size={28}
              color="var(--ocean-light)"
              style={{ animation: 'avatar-float 2s ease-in-out infinite', cursor: 'pointer', opacity: 0.5 }}
              onClick={() => document.querySelector('[data-section="timeline"]')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Courses selection modal */}
      <CoursesModal isOpen={showCourses} onClose={() => setShowCourses(false)} />
      <SchoolsModal isOpen={showSchools} onClose={() => setShowSchools(false)} />
    </>
  );
}

export default HeroSection;
