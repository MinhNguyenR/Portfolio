import { Sun, Moon, Cat, Palette, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
  { id: 'dark', label: 'Ocean Dark', icon: Moon, desc: 'Nền tối Ocean Blue', color: '#0a1628' },
  { id: 'light', label: 'Ocean Light', icon: Sun, desc: 'Nền sáng dễ đọc', color: '#e8eef4' },
  { id: 'hachiware-dark', label: 'Hachiware Blue Mode', icon: Cat, desc: 'Blue tone, sáng dịu', color: '#dbeafe' },
  { id: 'hachiware-light', label: 'Hachiware White Mode', icon: Cat, desc: 'White & pink', color: '#fff7fb' },
];

function SettingsPanel({ open, onClose }) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="settings-panel"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="settings-header">
              <h3>
                <Palette size={18} /> Giao Diện
              </h3>
              <button className="settings-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="settings-themes">
              {themes.map(t => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    className={`settings-theme-btn ${isActive ? 'active' : ''}`}
                    onClick={() => { setTheme(t.id); }}
                  >
                    <div
                      className="settings-theme-preview"
                      style={{ background: t.color }}
                    >
                      <Icon size={20} color={t.color === '#0a1628' || t.color === '#1a1020' ? '#93c5fd' : '#1a2332'} />
                    </div>
                    <div className="settings-theme-info">
                      <span className="settings-theme-name">{t.label}</span>
                      <span className="settings-theme-desc">{t.desc}</span>
                    </div>
                    {isActive && <span className="settings-theme-active">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="settings-footer">
              <p>🐱 Hachiware modes = mọi thứ đều Hachiware!</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SettingsPanel;
