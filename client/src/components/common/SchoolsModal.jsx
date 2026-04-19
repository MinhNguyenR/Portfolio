import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

/**
 * SchoolsModal
 */
function SchoolsModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/content/school').then(res => setSchools(res.data.items)).catch(console.error);
    }
  }, [isOpen]);

  const handleSelect = (slug) => {
    onClose();
    navigate(`/school/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="courses-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="courses-modal"
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="courses-modal-header">
              <div>
                <h3>🏫 Trường học nền tảng</h3>
                <p>Nơi theo học chương trình chính khóa</p>
              </div>
              <button className="courses-modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Grid */}
            <div className="courses-modal-grid">
              {schools.map((school, i) => (
                <motion.button
                  key={school.slug}
                  className="course-center-card"
                  onClick={() => handleSelect(school.slug)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="course-center-logo" style={{ background: (school.meta?.accentColor || '#3b82f6') + '22', color: (school.meta?.accentColor || '#3b82f6') }}>
                    {school.icon || '🏫'}
                  </div>
                  <div className="course-center-info">
                    <div className="course-center-name">{school.title}</div>
                    <div className="course-center-tagline">{school.subtitle || school.meta?.tagline || ''}</div>
                    <div className="course-center-period" style={{ color: (school.meta?.accentColor || '#3b82f6') }}>
                      📅 {school.meta?.myJourney?.period || '—'}
                    </div>
                  </div>
                  <div className="course-center-arrow" style={{ color: (school.meta?.accentColor || '#3b82f6') }}>→</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SchoolsModal;
