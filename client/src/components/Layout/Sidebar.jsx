import { Home, Clock, FlaskConical, FolderOpen, Award, FileText, Mail, Settings, Archive, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SettingsPanel from '../Theme/SettingsPanel';
import { useLanguage } from '../../hooks/useLanguage';

const mainSections = [
  { id: 'hero', icon: Home, labelKey: 'nav_home' },
  { id: 'timeline', icon: Clock, labelKey: 'nav_timeline' },
  { id: 'research', icon: FlaskConical, labelKey: 'nav_research' },
  { id: 'projects', icon: FolderOpen, labelKey: 'nav_projects' },
  { id: 'certificates', icon: Award, labelKey: 'nav_certificates' },
  { id: 'cv', icon: FileText, labelKey: 'nav_cv' },
  { id: 'contact', icon: Mail, labelKey: 'nav_contact' },
];

function Sidebar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useLanguage();

  const vaultLinks = [
    { id: 'vault-project', icon: FolderOpen, label: lang === 'vi' ? 'Kho Dự Án' : 'Projects Vault', path: '/vault/project' },
    { id: 'vault-certificate', icon: GraduationCap, label: lang === 'vi' ? 'Kho Chứng Chỉ' : 'Certificates Vault', path: '/vault/certificate' },
    { id: 'vault-research', icon: FlaskConical, label: lang === 'vi' ? 'Kho Nghiên Cứu' : 'Research Vault', path: '/vault/research' },
  ];

  useEffect(() => {
    if (location.pathname !== '/') return;
    const sectionEls = document.querySelectorAll('[data-section]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('data-section'));
          }
        });
      },
      { threshold: 0.3 }
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location]);

  const handleNav = (item) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(`[data-section="${item.id}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(`[data-section="${item.id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVault = (link) => {
    navigate(link.path);
  };

  const isVaultActive = (link) => location.pathname === link.path;

  return (
    <>
      <aside className="sidebar">
        {/* Main navigation */}
        {mainSections.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === '/' && activeSection === item.id;

          return (
            <button
              key={item.id}
              className={`sidebar-icon ${isActive ? 'active' : ''}`}
              onClick={() => handleNav(item)}
              title={t(item.labelKey)}
            >
              <Icon size={18} />
            </button>
          );
        })}

        {/* Separator */}
        <div className="sidebar-separator" />

        {/* Vault direct links */}
        {vaultLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              className={`sidebar-icon ${isVaultActive(link) ? 'active' : ''}`}
              onClick={() => handleVault(link)}
              title={link.label}
            >
              <Icon size={18} />
            </button>
          );
        })}

        {/* Separator */}
        <div className="sidebar-separator" />

        {/* Settings */}
        <button
          className={`sidebar-icon ${settingsOpen ? 'active' : ''}`}
          onClick={() => setSettingsOpen(prev => !prev)}
          title={lang === 'vi' ? 'Cài đặt giao diện' : 'Settings'}
        >
          <Settings size={18} />
        </button>
      </aside>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export default Sidebar;
