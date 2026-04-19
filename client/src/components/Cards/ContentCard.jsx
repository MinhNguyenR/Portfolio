import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

function ContentCard({ item, index = 0 }) {
  const navigate = useNavigate();
  const { getLocalized } = useLanguage();
  const isLocked = item.title === 'Coming Soon' || item.title === 'Introduction Letters';

  const handleClick = () => {
    if (isLocked) return;
    navigate(`/detail/${item.type}/${item.slug}`);
  };

  const title = getLocalized(item, 'title');
  const subtitle = getLocalized(item, 'subtitle');
  const description = getLocalized(item, 'description');

  return (
    <div
      className={`content-card content-card-${item.type} animate-fade-in-up delay-${Math.min(index + 1, 5)} ${isLocked ? 'card-locked' : ''}`}
      onClick={handleClick}
    >
      {isLocked ? (
        <>
          <div className="card-icon"><Lock size={32} color="var(--ocean-mid)" /></div>
          <h4 className="card-title" style={{ color: 'var(--ocean-mid)' }}>{title}</h4>
          <p className="card-subtitle">{subtitle || 'Coming Soon'}</p>
        </>
      ) : (
        <>
          <div className="card-type-badge">{item.category || item.type}</div>
          <div className="card-icon">{item.icon}</div>
          <h4 className="card-title">{title}</h4>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
          <p className="card-description">{description}</p>
          {item.tags && item.tags.length > 0 && (
            <div className="card-tags">
              {item.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="card-tag">{tag}</span>
              ))}
              {item.tags.length > 4 && (
                <span className="card-tag">+{item.tags.length - 4}</span>
              )}
            </div>
          )}
          {item.date && <p className="card-date">📅 {item.date}</p>}
        </>
      )}
    </div>
  );
}

export default ContentCard;
