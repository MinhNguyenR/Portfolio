import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ContentCard from './ContentCard';
import { useFeatured } from '../../hooks/useContent';
import LoadingSpinner from '../common/LoadingSpinner';
import { useLanguage } from '../../hooks/useLanguage';

function PreviewGrid({ type }) {
  const { items, total, loading } = useFeatured(type);
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (loading) return <LoadingSpinner />;

  const sectionKey = type === 'project' ? 'section_projects' : type === 'research' ? 'section_research' : 'section_certificates';

  return (
    <div className="section" data-section={type === 'project' ? 'projects' : type === 'research' ? 'research' : type === 'certificate' ? 'certificates' : type}>
      <div className="section-header">
        <h2 className="section-title">{t(`${sectionKey}_title`)}</h2>
        <p className="section-subtitle">{t(`${sectionKey}_subtitle`)}</p>
      </div>

      <div className="preview-grid">
        {items.map((item, i) => (
          <ContentCard key={item._id} item={item} index={i} />
        ))}
      </div>

      {total > 3 && (
        <button
          className="view-all-btn"
          onClick={() => navigate(`/vault/${type}`)}
        >
          {t('view_all')} <ArrowRight size={16} />
          <span className="count-badge">{total}</span>
        </button>
      )}
    </div>
  );
}

export default PreviewGrid;
