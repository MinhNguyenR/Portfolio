import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const navItems = [
  { id: 'hero', labelKey: 'nav_home', href: '/#hero' },
  { id: 'research', labelKey: 'nav_research', href: '/#research' },
  { id: 'projects', labelKey: 'nav_projects', href: '/#projects' },
  { id: 'certificates', labelKey: 'nav_certificates', href: '/#certificates' },
  { id: 'contact', labelKey: 'nav_contact', href: '/#contact' },
];

function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { lang, setLang, t } = useLanguage();

  const scrollTo = (id) => {
    const el = document.querySelector(`[data-section="${id}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <Home size={20} className="highlight" />
        <span><span className="highlight">Minh</span>.dev</span>
      </Link>

      <div className="navbar-links" style={{ display: 'flex', alignItems: 'center' }}>
        {isHome ? (
          navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
            >
              {t(item.labelKey)}
            </button>
          ))
        ) : (
          <Link to="/" className="nav-back-btn">
            <ArrowLeft size={16} />
            {t('back_to_home')}
          </Link>
        )}

        <div className="lang-switcher" style={{ marginLeft: '1rem', display: 'flex', gap: '5px', background: 'rgba(59,130,246,0.1)', padding: '2px', borderRadius: 'var(--radius-full)' }}>
          {['vi', 'en', 'de'].map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '2px 8px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-full)',
                background: lang === l ? 'var(--ocean-blue)' : 'transparent',
                color: lang === l ? 'white' : 'var(--ocean-light)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
