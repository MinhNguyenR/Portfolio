import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

/**
 * CoursesModal — shows training centers, click one to go to its page
 */
function CoursesModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/content/course').then(res => setCourses(res.data.items)).catch(console.error);
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
                <h3>📚 Trung tâm đào tạo</h3>
                <p>{courses.length} trung tâm mình đã học qua — click để xem chi tiết</p>
              </div>
              <button className="courses-modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Centers grid */}
            <div className="courses-modal-grid">
              {courses.map((center, i) => (
                <motion.button
                  key={center.slug}
                  className="course-center-card"
                  onClick={() => handleSelect(center.slug)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="course-center-logo" style={{ background: (center.meta?.accentColor || '#10b981') + '22', color: (center.meta?.accentColor || '#10b981') }}>
                    {center.icon || '🖥️'}
                  </div>
                  <div className="course-center-info">
                    <div className="course-center-name">{center.title}</div>
                    <div className="course-center-tagline">{center.subtitle || center.meta?.tagline || ''}</div>
                    <div className="course-center-period" style={{ color: (center.meta?.accentColor || '#10b981') }}>
                      📅 {center.meta?.myJourney?.period || '—'}
                    </div>
                  </div>
                  <div className="course-center-arrow" style={{ color: (center.meta?.accentColor || '#10b981') }}>→</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CoursesModal;
