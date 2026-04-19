import { motion } from 'framer-motion';

export default function IntroductionVault() {
  return (
    <section className="section" id="introduction-section">
      <motion.div
        className="intro-vault glass-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="intro-vault__circuit" />

        <motion.div
          className="intro-vault__lock"
          animate={{
            scale: [1, 1.08, 1],
            filter: [
              'drop-shadow(0 0 10px rgba(0, 245, 255, 0.3))',
              'drop-shadow(0 0 25px rgba(0, 245, 255, 0.7))',
              'drop-shadow(0 0 10px rgba(0, 245, 255, 0.3))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🔐
        </motion.div>

        <h2 className="intro-vault__title">Introduction Letters</h2>
        <p className="intro-vault__subtitle">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ▸ COMING SOON ◂
          </motion.span>
        </p>

        <motion.div
          style={{
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--neon-cyan), transparent)',
            margin: '20px auto 0',
          }}
          animate={{
            scaleX: [0.5, 1, 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
