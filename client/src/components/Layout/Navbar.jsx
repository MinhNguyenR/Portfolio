import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Menu, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const navItems = [
  { id: 'hero', labelKey: 'nav_home', href: '/#hero' },
  { id: 'research', labelKey: 'nav_research', href: '/#research' },
  { id: 'projects', labelKey: 'nav_projects', href: '/#projects' },
  { id: 'certificates', labelKey: 'nav_certificates', href: '/#certificates' },
  { id: 'contact', labelKey: 'nav_contact', href: '/#contact' },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { lang, setLang, t } = useLanguage();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const scrollTo = (id) => {
    const el = document.querySelector(`[data-section="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      closeMenu();
    }
  };

  return (
    <nav className={`navbar ${isOpen ? 'is-open' : ''}`}>
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <Home size={20} className="highlight" />
        <span><span className="highlight">Minh</span>.dev</span>
      </Link>

      {/* Burger Button - Only visible on mobile via CSS */}
      <button className="navbar-burger" onClick={toggleMenu} aria-label="Toggle menu">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <div className="navbar-nav-items">
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
            <Link to="/" className="nav-back-btn" onClick={closeMenu}>
              <ArrowLeft size={16} />
              {t('back_to_home')}
            </Link>
          )}
        </div>

        <div className="lang-switcher">
          {['vi', 'en', 'de'].map(l => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                closeMenu();
              }}
              className={lang === l ? 'active' : ''}
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
