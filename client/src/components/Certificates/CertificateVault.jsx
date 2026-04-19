import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiLockClosed } from 'react-icons/hi';
import { certificates } from '../../data/profile';

function CertCard({ cert, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      className={`cert-card glass-card ${!cert.visible ? 'cert-card--hidden' : ''}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: cert.visible ? 1 : 0.3, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={cert.visible ? { scale: 1.03, rotateY: 5 } : {}}
      style={{ perspective: '1000px' }}
    >
      {!cert.visible && <span className="cert-card__lock"><HiLockClosed /></span>}

      <div className="cert-card__icon">
        {cert.visible ? '📜' : '🔒'}
      </div>
      <h3 className="cert-card__title">{cert.title}</h3>
      <p className="cert-card__issuer">{cert.issuer}</p>
      <p className="cert-card__date">{cert.date}</p>

      {cert.visible && cert.slug && (
        <Link
          to={`/detail/certificate/${cert.slug}`}
          className="glow-btn"
          style={{ fontSize: '0.78rem', padding: '8px 18px', marginTop: '8px', display: 'inline-block' }}
          onClick={(e) => e.stopPropagation()}
        >
          Xem chứng chỉ
        </Link>
      )}
    </motion.div>
  );
}

export default function CertificateVault() {
  return (
    <section className="section" id="certificates-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Chứng Chỉ</h2>
        <p className="section-subtitle">Bằng cấp và chứng nhận chuyên môn</p>
      </motion.div>

      <div className="cert-grid">
        {certificates.map((cert, index) => (
          <CertCard key={cert.id} cert={cert} index={index} />
        ))}
      </div>
    </section>
  );
}
