import { useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useContentList } from '../hooks/useContent';
import ContentCard from '../components/Cards/ContentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

function VaultPage() {
  const { type } = useParams();
  const { items, total, loading, hasMore, loadMore, remaining } = useContentList(type);
  const { lang, t } = useLanguage();

  const sectionKey = type === 'project' ? 'section_projects' : type === 'research' ? 'section_research' : 'section_certificates';

  return (
    <div className="page-content">
      <div className="vault-page">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">{t(`${sectionKey}_title`)}</h1>
          <p className="section-subtitle">
            {t(`${sectionKey}_subtitle`)} — {total} {lang === 'vi' ? 'mục' : 'items'}
          </p>
        </div>

        {loading && items.length === 0 ? (
          <LoadingSpinner text={t('load_more')} />
        ) : (
          <>
            <div className="vault-grid">
              {items.map((item, i) => (
                <ContentCard key={item._id} item={item} index={i % 9} />
              ))}
            </div>

            {hasMore && (
              <button className="load-more-btn" onClick={loadMore} disabled={loading}>
                <ChevronDown size={18} />
                {loading ? t('load_more') : (lang === 'vi' ? 'Xem thêm' : 'Load more')}
                <span className="remaining">({remaining} {lang === 'vi' ? 'mục còn lại' : 'items remaining'})</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VaultPage;
