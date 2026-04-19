import { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import HeroSection from '../components/Hero/HeroSection';
import Timeline from '../components/Timeline/Timeline';
import PreviewGrid from '../components/Cards/PreviewGrid';
import ContactSection from '../components/Contact/ContactSection';
import { Award, FileText } from 'lucide-react';
import api from '../utils/api';

import { useLanguage } from '../hooks/useLanguage';

function CVSection() {
  const [profile, setProfile] = useState(null);
  const { lang, t, getLocalized } = useLanguage();

  useEffect(() => {
    api.get('/profile')
      .then(res => setProfile(res.data))
      .catch(() => {});
  }, []);

  if (!profile) return null;

  const skillsData = (lang === 'vi' ? profile.skills : profile.translations?.[lang]?.skills) || profile.skills || {};
  const currentCv = (lang === 'vi' ? profile.cv : profile.translations?.[lang]?.cv) || profile.cv || {};
  
  const localizedObjective = currentCv.objective;
  const localizedHighlights = currentCv.highlights || [];

  return (
    <div className="section" data-section="cv">
      <div className="section-header">
        <h2 className="section-title">Curriculum Vitae</h2>
        <p className="section-subtitle">{t('hero_subtitle')}</p>
      </div>

      <div className="cv-section">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
          <FileText size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {lang === 'vi' ? 'Mục tiêu nghiên cứu' : lang === 'en' ? 'Research objective' : 'Forschungsziel'}
        </h3>
        <p style={{ color: 'var(--ocean-pale)', lineHeight: 1.7, marginBottom: '2rem' }}>
          {localizedObjective || ''}
        </p>

        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
          <Award size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {lang === 'vi' ? 'Thành tích nổi bật' : lang === 'en' ? 'Key highlights' : 'Höhepunkte'}
        </h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          {localizedHighlights.map((h, i) => (
            <li key={i} style={{ color: 'var(--ocean-pale)', paddingLeft: '1.2rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--ocean-sky)' }}>▸</span>
              {h}
            </li>
          ))}
        </ul>

        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
          {lang === 'vi' ? 'Kỹ năng chuyên môn' : lang === 'en' ? 'Technical skills' : 'Technische Fähigkeiten'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {Object.entries(skillsData).map(([category, items]) => (
            <div key={category} style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--ocean-sky)', marginBottom: '0.5rem' }}>{category}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {(Array.isArray(items) ? items : []).map((item) => (
                  <span key={item} className="card-tag">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="main-content">
      <Sidebar />
      <main>
        <HeroSection />
        <Timeline />
        <PreviewGrid type="research" />
        <PreviewGrid type="project" />
        <PreviewGrid type="certificate" />
        <CVSection />
        <ContactSection />
      </main>
    </div>
  );
}

export default HomePage;
