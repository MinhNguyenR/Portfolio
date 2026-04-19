import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiExternalLink, HiStar } from 'react-icons/hi';
import { projects } from '../../data/profile';

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'research', label: 'Research' },
  { id: 'ai', label: 'AI / ML' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'web', label: 'Web' },
];

function ProjectCard({ project, index, trackInteraction }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={ref}
      className="project-card glass-card scanline"
      style={{ '--card-color': project.color }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={() => {
        if (trackInteraction) trackInteraction('project_view', project.id);
      }}
    >
      {project.highlight && <div className="project-card__highlight" />}

      <span className="project-card__type">{project.type}</span>
      <h3 className="project-card__name">{project.name}</h3>
      <p className="project-card__desc">{project.description}</p>

      <div className="project-card__tech">
        {project.tech.map((t) => (
          <span key={t} className="tech-badge" style={{ borderColor: `${project.color}40`, color: project.color, background: `${project.color}12` }}>
            {t}
          </span>
        ))}
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="project-card__link"
        onClick={(e) => {
          e.stopPropagation();
          if (trackInteraction) trackInteraction('link_click', `github-${project.id}`);
        }}
      >
        <HiExternalLink /> GitHub →
      </a>
    </motion.div>
  );
}

export default function ProjectVault({ trackInteraction }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.type === activeFilter);

  // Mouse drag scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="vault grid-bg" id="projects-section">
      <div className="vault__header">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Project Vault</h2>
          <p className="section-subtitle">Kho dự án — kéo ngang để khám phá</p>
        </motion.div>

        <motion.div
          className="vault__filters"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              className={`vault__filter ${activeFilter === tab.id ? 'vault__filter--active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>
      </div>

      <div
        className="vault__carousel"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            trackInteraction={trackInteraction}
          />
        ))}
      </div>

      <div className="vault__projector" />
    </section>
  );
}
