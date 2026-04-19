import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HiChevronDown, HiChevronUp, HiExternalLink } from 'react-icons/hi';
import { research } from '../../data/profile';

function ResearchCard({ item, index, trackInteraction }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      className={`research-card glass-card ${expanded ? 'research-card--expanded' : ''}`}
      style={{ '--card-color': item.color }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={() => {
        setExpanded(!expanded);
        if (trackInteraction) trackInteraction('click', `research-${item.id}`);
      }}
    >
      <div className="research-card__header">
        <div>
          <h3 className="research-card__title">{item.title}</h3>
          <p className="research-card__subtitle">{item.subtitle}</p>
        </div>
        <span className="research-card__expand">
          {expanded ? <HiChevronUp /> : <HiChevronDown />}
        </span>
      </div>

      <p className="research-card__desc">{item.description}</p>

      <div className="research-card__details">
        <ul className="research-card__features">
          {item.keyFeatures.map((feature, i) => (
            <li key={i} className="research-card__feature">{feature}</li>
          ))}
        </ul>

        <div className="research-card__tech">
          {item.tech.map((t) => (
            <span key={t} className="tech-badge">{t}</span>
          ))}
        </div>

        {item.github && (
          <a
            href={item.github}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__link"
            style={{ marginTop: '12px', display: 'inline-flex' }}
            onClick={(e) => e.stopPropagation()}
          >
            <HiExternalLink /> View on GitHub
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function ResearchShowcase({ trackInteraction }) {
  return (
    <section className="section" id="research-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Nghiên Cứu</h2>
        <p className="section-subtitle">6 công trình nghiên cứu trong lĩnh vực AI Systems, LLM Optimization, và Chip Architecture</p>
      </motion.div>

      <div>
        {research.map((item, index) => (
          <ResearchCard
            key={item.id}
            item={item}
            index={index}
            trackInteraction={trackInteraction}
          />
        ))}
      </div>
    </section>
  );
}
