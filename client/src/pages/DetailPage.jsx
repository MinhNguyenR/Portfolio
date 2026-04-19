import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, GitFork, Mail, Calendar, User, Eye, ExternalLink, FileText, Database, Lock } from 'lucide-react';
import { useContentDetail } from '../hooks/useContent';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CertificateImageEmbed from '../components/common/CertificateImageEmbed';
import { useLanguage } from '../hooks/useLanguage';

function DetailPage() {
  const { type, slug } = useParams();
  const { item, loading, error } = useContentDetail(type, slug);
  const { lang, t, getLocalized } = useLanguage();
  const isResearchLocked = type === 'research' && item?.contentLocked;

  if (loading) return <div className="page-content"><LoadingSpinner text={t('load_more')} /></div>;
  if (error) return (
    <div className="page-content">
      <div className="detail-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>404 — Not found</h2>
        <p style={{ color: 'var(--ocean-light)', margin: '1rem 0' }}>{error}</p>
        <Link to="/" className="btn btn-primary">{t('back_to_home')}</Link>
      </div>
    </div>
  );

  const title = getLocalized(item, 'title');
  const subtitle = getLocalized(item, 'subtitle');
  const description = getLocalized(item, 'description');
  const readme = getLocalized(item, 'readme');

  return (
    <div className="page-content">
      <div className="detail-page">
        {/* Back button */}
        <Link to={`/vault/${type}`} className="nav-back-btn" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          {lang === 'vi' ? 'Quay lại' : 'Back to'} {type === 'project' ? t('nav_projects') : type === 'research' ? t('nav_research') : t('nav_certificates')}
        </Link>

        {/* Header */}
        <div className={`detail-header detail-shell detail-shell-${type} animate-fade-in-up`}>
          <div className="detail-type-badge">
            {item.icon} {type === 'project' ? t('nav_projects') : type === 'research' ? t('nav_research') : t('nav_certificates')}
          </div>
          <h1 className="detail-title">{title}</h1>
          {subtitle && <p className="detail-subtitle">{subtitle}</p>}

          <div className="detail-meta">
            <div className="detail-meta-item">
              <User size={16} />
              {item.author}
            </div>
            {item.date && (
              <div className="detail-meta-item">
                <Calendar size={16} />
                {item.date}
              </div>
            )}
            <div className="detail-meta-item">
              <Eye size={16} />
              {item.viewCount} {lang === 'vi' ? 'lượt xem' : 'views'}
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="detail-tags">
              {item.tags.map((tag) => (
                <span key={tag} className="detail-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* README Content */}
        <div className="animate-fade-in-up delay-2">
          {description && (
            <div className={`detail-description-box detail-shell detail-shell-${type}`}>
              {description}
            </div>
          )}

          {isResearchLocked ? (
            <div className={`detail-markdown-shell detail-shell detail-shell-${type}`}>
              <div className="detail-locked-note">
                <Lock size={18} />
                <span>Locked content.</span>
              </div>
            </div>
          ) : (
            <>
              <div className={`detail-markdown-shell detail-shell detail-shell-${type}`}>
                <MarkdownRenderer content={readme} />
              </div>
            </>
          )}
        </div>

        {type === 'certificate' && (item.file || slug) && (
          <div className={`animate-fade-in-up delay-2 certificate-print-blocked detail-certificate-shell detail-shell detail-shell-${type}`} style={{ marginTop: '2rem' }}>
            <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{lang === 'vi' ? 'Xem chứng chỉ (Image)' : 'View Certificate'}</h3>
            <CertificateImageEmbed file={item.file} slug={slug} title={title} />
          </div>
        )}

        {/* Links */}
        <div className={`detail-links detail-shell detail-shell-${type} animate-fade-in-up delay-3`}>
          {item.github && (
            <a href={item.github} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <GitFork size={18} />
              GitHub
              <ExternalLink size={14} />
            </a>
          )}
          {item.zenodo && (
            <a href={item.zenodo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <Database size={18} />
              Zenodo
              <ExternalLink size={14} />
            </a>
          )}
          {item.paper && (
            <a href={item.paper} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <FileText size={18} />
              Paper
              <ExternalLink size={14} />
            </a>
          )}
          <a href="mailto:nguyendangtuongminh555@gmail.com" className="btn btn-ghost">
            <Mail size={18} />
            {t('nav_contact')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
