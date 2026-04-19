import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import OceanBackground from './components/common/OceanBackground';
import HomePage from './pages/HomePage';
import VaultPage from './pages/VaultPage';
import DetailPage from './pages/DetailPage';
import AdminPage from './pages/AdminPage';
import SchoolPage from './pages/SchoolPage';
import ChatBox from './components/Chat/ChatBox';
import { collectFingerprint } from './utils/fingerprint';
import api from './utils/api';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function TrackVisitor() {
  const { pathname } = useLocation();
  const firstPath = useRef(true);
  useEffect(() => {
    const delay = firstPath.current ? 1200 : 350;
    firstPath.current = false;
    const t = setTimeout(async () => {
      try {
        const data = await collectFingerprint();
        await api.post('/track', data);
      } catch { /* silent */ }
    }, delay);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      <OceanBackground />
      <ScrollToTop />
      <TrackVisitor />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vault/:type" element={<VaultPage />} />
        <Route path="/detail/:type/:slug" element={<DetailPage />} />
        {/* School: sion-north-wake, mindx, brightchamps, cole */}
        <Route path="/school/:slug" element={<SchoolPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatBox />}
    </div>
  );
}

export default App;
