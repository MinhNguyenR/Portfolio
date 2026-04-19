import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Minus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../Theme/ThemeProvider';
import api from '../../utils/api';
import { useLanguage } from '../../hooks/useLanguage';

function ChatBox() {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chat_welcome'),
    },
  ]);
  
  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: t('chat_welcome') }]);
    }
  }, [lang]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [showPortal, setShowPortal] = useState(false);
  const [portalKey, setPortalKey] = useState('');
  const clickTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { isHachiware } = useTheme();

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Clear unread when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) setUnreadCount(0);
  }, [isOpen, isMinimized]);

  const handleMascotClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (clickTimer.current) clearTimeout(clickTimer.current);

    if (newCount >= 5) {
      setClickCount(0);
      setShowPortal(true);
      return;
    }

    clickTimer.current = setTimeout(() => {
      setClickCount(0);
      if (!showPortal) {
        setIsOpen(prev => !prev);
        setIsMinimized(false);
      }
    }, 400);
  };

  const handlePortalSubmit = () => {
    const key = portalKey.trim();
    if (!key) return;
    sessionStorage.setItem('adminKey', key);
    window.location.href = '/admin';
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg.content, history, lang }, { timeout: 120000 });
      const reply = res.data.reply || (lang === 'vi' ? 'Hachiware chưa hiểu...' : 'I don\'t understand...');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'vi' ? 'Lỗi kết nối...' : 'Connection error...',
      }]);
    }
    setLoading(false);
  }, [input, loading, messages, isOpen, isMinimized, lang]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (role, content) => {
    if (role !== 'assistant') return content;
    return (
      <div className="chat-markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
            pre: ({ ...props }) => <pre className="chat-markdown-pre" {...props} />,
            code: ({ ...props }) => <code className="chat-markdown-code" {...props} />,
            table: ({ ...props }) => <div className="chat-markdown-table-wrap"><table {...props} /></div>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <>
      <div
        className={`mascot-corner ${clickCount > 0 ? 'mascot-clicking' : ''}`}
        onClick={handleMascotClick}
        title="Hachiware 🐱"
      >
        <img src="/images/mascot.png" alt="Hachiware mascot" />
        {unreadCount > 0 && !isOpen && (
          <motion.span
            className="mascot-unread-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {unreadCount}
          </motion.span>
        )}
      </div>

      <AnimatePresence>
        {showPortal && (
          <motion.div
            className="admin-portal-overlay"
            onClick={(e) => e.target === e.currentTarget && (setShowPortal(false), setPortalKey(''))}
          >
            <div className="admin-portal">
              <h3>🔐 Hachiware Secret Portal</h3>
              <div className="admin-portal-input">
                <input
                  type="password"
                  value={portalKey}
                  onChange={e => setPortalKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePortalSubmit()}
                  placeholder="Mã admin..."
                  autoFocus
                />
                <button onClick={handlePortalSubmit} className="btn btn-primary">Vào</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chatbox ${isMinimized ? 'chatbox-minimized' : ''}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
          >
            <div className="chatbox-header" onClick={() => isMinimized && setIsMinimized(false)}>
              <div className="chatbox-header-info">
                <img src="/images/mascot.png" alt="Hachiware" className="chatbox-avatar" />
                <div>
                  <span className="chatbox-name">Hachiware</span>
                  <span className="chatbox-status">
                    {loading ? '...' : 'Online'}
                  </span>
                </div>
              </div>
              <div className="chatbox-header-actions">
                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(prev => !prev); }}><Minus size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}><X size={16} /></button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="chatbox-messages">
                  {messages.map((msg, i) => (
                    <div key={i} className={`chatbox-msg chatbox-msg-${msg.role}`}>
                      <div className="chatbox-msg-content">
                        {renderMessageContent(msg.role, msg.content)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chatbox-input">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('chat_placeholder')}
                    disabled={loading}
                  />
                  <button onClick={handleSend} disabled={loading || !input.trim()} className="chatbox-send">
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBox;
