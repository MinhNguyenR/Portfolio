import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Eye, MousePointer, MessageSquare, BarChart3, Globe,
  Monitor, Clock, TrendingUp, ArrowLeft, Shield, RefreshCw,
  Plus, Edit3, Trash2, Save, X, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import api from '../utils/api';

function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  // CMS state
  const [contentType, setContentType] = useState('project');
  const [contentItems, setContentItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Profile editing state
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('adminToken') || '';
    if (storedToken) {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchData();
  }, [authed]);

  const token = sessionStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, contactRes, profileRes] = await Promise.all([
        api.get('/admin/dashboard', { headers }),
        api.get('/admin/contacts', { headers }),
        api.get('/admin/profile', { headers }),
      ]);
      setDashboard(dashRes.data);
      setContacts(contactRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setAuthed(false);
        setAuthError('Phiên đăng nhập hết hạn hoặc không hợp lệ.');
      }
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    const key = adminKey.trim();
    if (!key) return;
    try {
      const res = await api.post('/admin/login', { password: key });
      sessionStorage.setItem('adminToken', res.data.token);
      setAuthed(true);
      setAuthError('');
    } catch (err) {
      setAuthError('Mật khẩu không đúng.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setAuthed(false);
    setDashboard(null);
    setContacts([]);
    setAdminKey('');
  };

  const fetchContent = async (type) => {
    try {
      const res = await api.get(`/admin/content/${type}`, { headers });
      setContentItems(res.data);
      return res.data;
    } catch (err) {
      console.error('Content fetch error:', err);
      return [];
    }
  };

  useEffect(() => {
    if (authed && activeTab === 'content') {
      fetchContent(contentType);
    }
  }, [authed, activeTab, contentType]);

  const fetchVisitorDetail = async (id) => {
    try {
      const res = await api.get(`/admin/visitors/${id}`, { headers });
      setSelectedVisitor(res.data);
    } catch (err) {
      console.error('Visitor detail error:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/admin/contacts/${id}/read`, {}, { headers });
      setContacts((prev) => prev.map((c) => c._id === id ? { ...c, read: true } : c));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // ═══ CMS Operations ═══
  const handleCreateContent = async (data) => {
    try {
      await api.post('/admin/content', { ...data, type: contentType }, { headers });
      await fetchContent(contentType);
      setShowCreateForm(false);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateContent = async (id, data) => {
    try {
      await api.put(`/admin/content/${id}`, data, { headers });
      await fetchContent(contentType);
      setEditingItem(null);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteContent = async (id) => {
    if (!confirm('Xác nhận xóa?')) return;
    try {
      await api.delete(`/admin/content/${id}`, { headers });
      await fetchContent(contentType);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/admin/profile', profileDraft, { headers });
      setProfile(res.data);
      setEditingProfile(false);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  // Not authed
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <Shield size={64} color="var(--ocean-mid)" />
        <h2 style={{ color: 'var(--ocean-mid)' }}>Admin Access</h2>
        <input
          type="password"
          className="form-input"
          style={{ width: 320, maxWidth: '90vw' }}
          placeholder="Nhập mật khẩu Admin"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
        />
        {authError && <p style={{ color: '#fca5a5', margin: 0 }}>{authError}</p>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handleLogin}>Đăng nhập</button>
          <Link to="/" className="btn btn-ghost">Go Home</Link>
        </div>
      </div>
    );
  }

  if (loading || !dashboard) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const { overview, content, recentVisitors, topPages, browserStats, deviceStats, dailyVisits } = dashboard;
  const maxDaily = Math.max(...dailyVisits.map((d) => d.count), 1);
  const maxBrowser = Math.max(...browserStats.map((b) => b.count), 1);

  return (
    <div className="page-content" style={{ paddingTop: '1rem' }}>
      <div className="admin-layout">
        {/* Header */}
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={28} />
              Admin Dashboard
            </h1>
            <p style={{ color: 'var(--ocean-light)', fontSize: '0.9rem' }}>
              Portfolio Analytics, Content & Profile Management
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-ghost" onClick={fetchData}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Trang chủ
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['overview', 'visitors', 'contacts', 'content', 'profile'].map((tab) => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setSelectedVisitor(null); }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'visitors' && `👥 Visitors (${overview.totalVisitors})`}
              {tab === 'contacts' && `💬 Contacts (${overview.unreadContacts} new)`}
              {tab === 'content' && '📦 Content CMS'}
              {tab === 'profile' && '👤 Profile'}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <>
            <div className="admin-stats-grid">
              <StatCard icon={<Users size={24} />} value={overview.totalVisitors} label="Total Visitors" />
              <StatCard icon={<TrendingUp size={24} />} value={overview.todayVisitors} label="Today" color="var(--blush-pink)" />
              <StatCard icon={<Eye size={24} />} value={overview.totalPageViews} label="Page Views" />
              <StatCard icon={<MousePointer size={24} />} value={overview.totalInteractions} label="Interactions" />
              <StatCard icon={<Users size={24} />} value={overview.weekVisitors} label="This Week" />
              <StatCard icon={<Users size={24} />} value={overview.monthVisitors} label="This Month" />
              <StatCard icon={<MessageSquare size={24} />} value={overview.totalContacts} label="Messages" />
              <StatCard icon={<Users size={24} />} value={overview.knownVisitors || 0} label="Known (Email)" color="var(--blush-pink)" />
            </div>

            <div className="admin-grid-2">
              <div className="admin-section">
                <h3 className="admin-section-title"><TrendingUp size={18} /> Daily Visitors (30 ngày)</h3>
                {dailyVisits.length === 0 ? (
                  <p style={{ color: 'var(--ocean-light)', fontSize: '0.85rem' }}>Chưa có dữ liệu</p>
                ) : (
                  dailyVisits.map((d) => (
                    <div key={d._id} className="admin-chart-bar">
                      <span className="admin-chart-bar-label">{d._id.slice(5)}</span>
                      <div className="admin-chart-bar-fill" style={{ width: `${(d.count / maxDaily) * 100}%` }}>
                        {d.count}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="admin-section">
                <h3 className="admin-section-title"><Globe size={18} /> Browsers</h3>
                {browserStats.map((b) => (
                  <div key={b._id || 'unknown'} className="admin-chart-bar">
                    <span className="admin-chart-bar-label">{b._id || 'Unknown'}</span>
                    <div className="admin-chart-bar-fill" style={{ width: `${(b.count / maxBrowser) * 100}%` }}>
                      {b.count}
                    </div>
                  </div>
                ))}
                <h3 className="admin-section-title" style={{ marginTop: '1.5rem' }}>
                  <Monitor size={18} /> Devices
                </h3>
                {deviceStats.map((d) => (
                  <div key={d._id || 'unknown'} className="admin-chart-bar">
                    <span className="admin-chart-bar-label">{d._id || 'Unknown'}</span>
                    <div className="admin-chart-bar-fill" style={{ width: `${(d.count / maxBrowser) * 100}%`, background: 'linear-gradient(90deg, var(--blush-pink), #f9a8d4)' }}>
                      {d.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <h3 className="admin-section-title"><Eye size={18} /> Top Sections</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>Section</th><th>Views</th><th>Avg Duration</th></tr>
                </thead>
                <tbody>
                  {topPages.map((p) => (
                    <tr key={p._id}>
                      <td>{p._id}</td>
                      <td>{p.count}</td>
                      <td>{p.avgDuration ? `${Math.round(p.avgDuration / 1000)}s` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ VISITORS TAB ═══ */}
        {activeTab === 'visitors' && (
          <div className="admin-grid-2">
            <div className="admin-section">
              <h3 className="admin-section-title"><Users size={18} /> Recent Visitors</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>Name/IP</th><th>Email</th><th>Browser</th><th>Visits</th><th>Last Visit</th><th></th></tr>
                </thead>
                <tbody>
                  {recentVisitors.map((v) => (
                    <tr key={v._id} style={{ cursor: 'pointer' }} onClick={() => fetchVisitorDetail(v._id)}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {v.name || v.ip || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: v.email ? 'var(--ocean-sky)' : 'var(--ocean-light)' }}>
                        {v.email || '—'}
                      </td>
                      <td>{v.browser?.name || '—'}</td>
                      <td>{v.visitCount}</td>
                      <td>{new Date(v.lastVisit).toLocaleString('vi-VN')}</td>
                      <td><Eye size={14} color="var(--ocean-sky)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-section">
              <h3 className="admin-section-title"><Eye size={18} /> Visitor Detail</h3>
              {selectedVisitor ? (
                <div>
                  <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(59,130,246,0.05)', borderRadius: 'var(--radius-md)' }}>
                    {selectedVisitor.visitor.name && <p><strong>Name:</strong> {selectedVisitor.visitor.name}</p>}
                    {selectedVisitor.visitor.email && <p><strong>Email:</strong> {selectedVisitor.visitor.email}</p>}
                    <p><strong>IP:</strong> {selectedVisitor.visitor.ip}</p>
                    <p><strong>Browser:</strong> {selectedVisitor.visitor.browser?.name} {selectedVisitor.visitor.browser?.version}</p>
                    <p><strong>OS:</strong> {selectedVisitor.visitor.os?.name} {selectedVisitor.visitor.os?.version || ''}</p>
                    <p><strong>Screen:</strong> {selectedVisitor.visitor.screen?.width}×{selectedVisitor.visitor.screen?.height} (avail {selectedVisitor.visitor.screen?.availWidth}×{selectedVisitor.visitor.screen?.availHeight}, DPR {selectedVisitor.visitor.screen?.pixelRatio ?? '—'})</p>
                    <p><strong>Language:</strong> {selectedVisitor.visitor.browser?.language || '—'} {selectedVisitor.visitor.browser?.languages?.length ? `(${selectedVisitor.visitor.browser.languages.join(', ')})` : ''}</p>
                    <p><strong>Timezone:</strong> {selectedVisitor.visitor.timezone?.zone || '—'} (offset {selectedVisitor.visitor.timezone?.offset ?? '—'})</p>
                    <p><strong>Network (IP API):</strong> {[selectedVisitor.visitor.network?.city, selectedVisitor.visitor.network?.region, selectedVisitor.visitor.network?.country].filter(Boolean).join(', ') || '—'} · ISP {selectedVisitor.visitor.network?.isp || '—'} · proxy {String(selectedVisitor.visitor.network?.proxy)} · mobile {String(selectedVisitor.visitor.network?.mobile)}</p>
                    <p><strong>Visits:</strong> {selectedVisitor.visitor.visitCount}</p>
                    <p><strong>First:</strong> {new Date(selectedVisitor.visitor.firstVisit).toLocaleString('vi-VN')}</p>
                    <p><strong>Entry:</strong> {selectedVisitor.visitor.entryPage || '—'} · <strong>Referrer:</strong> {selectedVisitor.visitor.referrer || 'direct'}</p>
                    {selectedVisitor.visitor.fingerprints && (
                      <pre style={{ fontSize: '0.72rem', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto', marginTop: 8 }}>{JSON.stringify(selectedVisitor.visitor.fingerprints, null, 0)}</pre>
                    )}
                    {selectedVisitor.visitor.clientExtra && Object.keys(selectedVisitor.visitor.clientExtra).length > 0 && (
                      <pre style={{ fontSize: '0.72rem', whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'auto', marginTop: 8 }}>{JSON.stringify(selectedVisitor.visitor.clientExtra, null, 2)}</pre>
                    )}
                  </div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Page Views ({selectedVisitor.pageViews.length})</h4>
                  <div style={{ maxHeight: 200, overflow: 'auto', marginBottom: '1rem' }}>
                    {selectedVisitor.pageViews.map((pv, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(59,130,246,0.05)', color: 'var(--ocean-pale)' }}>
                        <span style={{ color: 'var(--ocean-sky)' }}>{pv.section}</span>{' — '}{new Date(pv.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    ))}
                  </div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Interactions ({selectedVisitor.interactions.length})</h4>
                  <div style={{ maxHeight: 200, overflow: 'auto' }}>
                    {selectedVisitor.interactions.map((int, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(59,130,246,0.05)', color: 'var(--ocean-pale)' }}>
                        <span className="card-tag" style={{ marginRight: 6 }}>{int.type}</span>{int.target}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--ocean-light)', fontSize: '0.85rem' }}>Click vào visitor bên trái để xem chi tiết</p>
              )}
            </div>
          </div>
        )}

        {/* ═══ CONTACTS TAB ═══ */}
        {activeTab === 'contacts' && (
          <div className="admin-section">
            <h3 className="admin-section-title"><MessageSquare size={18} /> Messages ({contacts.length})</h3>
            {contacts.length === 0 ? (
              <p style={{ color: 'var(--ocean-light)' }}>Chưa có tin nhắn nào</p>
            ) : (
              contacts.map((c) => (
                <div key={c._id} style={{ padding: '1rem', marginBottom: '0.75rem', background: c.read ? 'transparent' : 'rgba(59,130,246,0.05)', border: `1px solid ${c.read ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.2)'}`, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ color: 'var(--white)' }}>{c.name}</strong>
                      <span style={{ color: 'var(--ocean-light)', fontSize: '0.8rem', marginLeft: 8 }}>{c.email}</span>
                      {c.phone && <span style={{ color: 'var(--ocean-light)', fontSize: '0.8rem', marginLeft: 8 }}>{c.phone}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ocean-light)' }}>{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                      {!c.read && (
                        <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => markRead(c._id)}>✓ Read</button>
                      )}
                    </div>
                  </div>
                  <p style={{ color: 'var(--ocean-pale)', fontSize: '0.9rem', lineHeight: 1.5 }}>{c.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ CONTENT CMS TAB ═══ */}
        {activeTab === 'content' && (
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['project', 'research', 'certificate', 'letter', 'school', 'course'].map(t => (
                  <button
                    key={t}
                    className={`admin-tab ${contentType === t ? 'active' : ''}`}
                    onClick={() => { setContentType(t); setEditingItem(null); setShowCreateForm(false); }}
                  >
                    {t === 'project' ? '💼' : t === 'research' ? '🔬' : t === 'certificate' ? '📜' : t === 'school' ? '🏫' : t === 'course' ? '🖥️' : '✉️'} {t}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={() => { setShowCreateForm(true); setEditingItem(null); }} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Thêm mới
              </button>
            </div>

            {/* Create form */}
            {showCreateForm && (
                    <ContentForm
                      adminKey={adminKey}
                type={contentType}
                onSave={handleCreateContent}
                onCancel={() => setShowCreateForm(false)}
                onRefresh={() => fetchContent(contentType)}
              />
            )}

            {/* Edit form */}
            {editingItem && (
                    <ContentForm
                      adminKey={adminKey}
                type={contentType}
                item={editingItem}
                onSave={(data) => handleUpdateContent(editingItem._id, data)}
                onCancel={() => setEditingItem(null)}
                onRefresh={async () => {
                  const items = await fetchContent(contentType);
                  if (!editingItem?._id) return;
                  const fresh = items.find((x) => x._id === editingItem._id);
                  if (fresh) setEditingItem(fresh);
                }}
              />
            )}

            {/* Content list */}
            <div style={{ marginTop: '1rem' }}>
              {contentItems.map(item => (
                <div key={item._id} className="admin-content-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon || '📄'}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--white)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ocean-light)' }}>
                        {item.slug} • {item.date} • Views: {item.viewCount || 0}
                        {item.featured && <span style={{ color: 'var(--blush-pink)', marginLeft: 8 }}>★ Featured</span>}
                        {!item.visible && <span style={{ color: '#ef4444', marginLeft: 8 }}>🔒 Hidden</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="btn btn-ghost" onClick={() => { setEditingItem(item); setShowCreateForm(false); }} style={{ padding: '0.3rem 0.6rem' }}>
                      <Edit3 size={14} />
                    </button>
                    <button className="btn btn-ghost" onClick={() => handleDeleteContent(item._id)} style={{ padding: '0.3rem 0.6rem', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {contentItems.length === 0 && (
                <p style={{ color: 'var(--ocean-light)', textAlign: 'center', padding: '2rem' }}>Chưa có content nào</p>
              )}
            </div>
          </div>
        )}

        {/* ═══ PROFILE TAB ═══ */}
        {activeTab === 'profile' && profile && (
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="admin-section-title" style={{ margin: 0 }}>
                <FileText size={18} /> Profile & Timeline Settings
              </h3>
              {!editingProfile ? (
                <button className="btn btn-primary" onClick={() => { setEditingProfile(true); setProfileDraft(JSON.parse(JSON.stringify(profile))); }} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <Edit3 size={16} /> Chỉnh sửa
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={handleSaveProfile} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <Save size={16} /> Lưu
                  </button>
                  <button className="btn btn-ghost" onClick={() => setEditingProfile(false)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <X size={16} /> Hủy
                  </button>
                </div>
              )}
            </div>

            {editingProfile && profileDraft ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-grid-2">
                  <div className="form-group">
                    <label>Tên</label>
                    <input className="form-input" value={profileDraft.name || ''} onChange={e => setProfileDraft(d => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <input className="form-input" value={profileDraft.subtitle || ''} onChange={e => setProfileDraft(d => ({ ...d, subtitle: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="form-input" value={profileDraft.email || ''} onChange={e => setProfileDraft(d => ({ ...d, email: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>SĐT</label>
                    <input className="form-input" value={profileDraft.phone || ''} onChange={e => setProfileDraft(d => ({ ...d, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>GitHub</label>
                    <input className="form-input" value={profileDraft.github || ''} onChange={e => setProfileDraft(d => ({ ...d, github: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input className="form-input" value={profileDraft.location || ''} onChange={e => setProfileDraft(d => ({ ...d, location: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mục tiêu nghiên cứu</label>
                  <textarea className="form-textarea" value={profileDraft.cv?.objective || ''} onChange={e => setProfileDraft(d => ({ ...d, cv: { ...d.cv, objective: e.target.value } }))} />
                </div>
                <div className="form-group">
                  <label>Lab Setup (mỗi dòng 1 item)</label>
                  <textarea className="form-textarea" value={(profileDraft.lab || []).join('\n')} onChange={e => setProfileDraft(d => ({ ...d, lab: e.target.value.split('\n') }))} />
                </div>
                <JsonEditor
                  label="Kỹ năng chuyên môn (JSON)"
                  value={profileDraft.skills || {}}
                  onChange={(val) => setProfileDraft(d => ({ ...d, skills: val }))}
                />
                <TimelineEditor
                  timeline={profileDraft.timeline || []}
                  onChange={(val) => setProfileDraft(d => ({ ...d, timeline: val }))}
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <InfoRow label="Tên" value={profile.name} />
                <InfoRow label="Subtitle" value={profile.subtitle} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="SĐT" value={profile.phone} />
                <InfoRow label="GitHub" value={profile.github} />
                <InfoRow label="Location" value={profile.location} />
                <InfoRow label="Lab" value={(profile.lab || []).join(' • ')} />
                <InfoRow label="Skills categories" value={`${Object.keys(profile.skills || {}).length} categories`} />
                <InfoRow label="Timeline items" value={`${(profile.timeline || []).length} entries`} />
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(59,130,246,0.12)', paddingTop: '1rem', marginTop: '1rem', color: 'var(--ocean-light)', fontSize: '0.85rem' }}>
              Hachiware background đang dùng ảnh cố định từ DB cho Blue Mode và White Mode.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ Helper Components ═══

function JsonEditor({ value, onChange, label, height = 200 }) {
  const [str, setStr] = useState('');
  useEffect(() => { setStr(JSON.stringify(value, null, 2)); }, [value]);
  return (
    <div className="form-group">
      <label>{label}</label>
      <textarea
        className="form-textarea"
        style={{ minHeight: height, fontFamily: 'monospace' }}
        value={str}
        onChange={e => {
          setStr(e.target.value);
          try { onChange(JSON.parse(e.target.value)); } catch(err) {}
        }}
        onBlur={() => {
           try { setStr(JSON.stringify(JSON.parse(str), null, 2)); } catch(e){}
        }}
      />
    </div>
  );
}

function TimelineEditor({ timeline, onChange }) {
  const add = () => onChange([{ date: '', title: '', subtitle: '', description: '', icon: '📌', category: 'project', schoolSlug: '' }, ...timeline]);
  const remove = (index) => onChange(timeline.filter((_, i) => i !== index));
  const update = (index, field, val) => {
    const next = [...timeline];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };
  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...timeline];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };
  const moveDown = (index) => {
    if (index === timeline.length - 1) return;
    const next = [...timeline];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>Timeline Entries</label>
        <button type="button" className="btn btn-secondary" onClick={add} style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>+ Thêm Mục Timeline</button>
      </div>
      {timeline.map((item, i) => (
        <div key={i} style={{ border: '1px solid rgba(59,130,246,0.15)', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.02)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
             <button type="button" className="btn btn-ghost" onClick={() => moveUp(i)} disabled={i === 0}>⬆️ Lên</button>
             <button type="button" className="btn btn-ghost" onClick={() => moveDown(i)} disabled={i === timeline.length - 1}>⬇️ Xuống</button>
             <button type="button" className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={() => remove(i)}>Xóa</button>
          </div>
          <div className="admin-grid-2">
            <div className="form-group"><label>Date (e.g. 2026)</label><input className="form-input" value={item.date || ''} onChange={e => update(i, 'date', e.target.value)} /></div>
            <div className="form-group"><label>Title</label><input className="form-input" value={item.title || ''} onChange={e => update(i, 'title', e.target.value)} /></div>
            <div className="form-group"><label>Subtitle</label><input className="form-input" value={item.subtitle || ''} onChange={e => update(i, 'subtitle', e.target.value)} /></div>
            <div className="form-group"><label>Icon (emoji)</label><input className="form-input" value={item.icon || ''} onChange={e => update(i, 'icon', e.target.value)} /></div>
            <div className="form-group"><label>Category</label><input className="form-input" value={item.category || ''} placeholder="school/course/project/research" onChange={e => update(i, 'category', e.target.value)} /></div>
            <div className="form-group"><label>Content Slug (Link to item)</label><input className="form-input" value={item.schoolSlug || ''} onChange={e => update(i, 'schoolSlug', e.target.value)} /></div>
          </div>
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
             <label>Description (hỗ trợ xuống dòng)</label>
             <textarea className="form-textarea" value={item.description || ''} onChange={e => update(i, 'description', e.target.value)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="admin-stat-card">
      <div style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
        {typeof icon === 'string' ? icon : icon}
      </div>
      <div className="admin-stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(59,130,246,0.08)' }}>
      <span style={{ color: 'var(--ocean-light)', fontSize: '0.85rem', width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--white)', fontSize: '0.9rem' }}>{value || '—'}</span>
    </div>
  );
}

function ContentForm({ type, item, onSave, onCancel, onRefresh }) {
  const token = sessionStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [certImageFile, setCertImageFile] = useState(null);
  const [certUploadStatus, setCertUploadStatus] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [data, setData] = useState({
    type: type,
    slug: item?.slug || '',
    title: item?.title || '',
    subtitle: item?.subtitle || '',
    description: item?.description || '',
    readme: item?.readme || '',
    category: item?.category || '',
    tags: item?.tags?.join(', ') || '',
    github: item?.github || '',
    zenodo: item?.zenodo || '',
    paper: item?.paper || '',
    demo: item?.demo || '',
    file: item?.file || '',
    icon: item?.icon || '',
    date: item?.date || '',
    featured: item?.featured || false,
    visible: item?.visible !== false,
    contentLocked: item?.contentLocked || false,
    order: item?.order || 0,
  });
  const [metaStr, setMetaStr] = useState(item?.meta ? JSON.stringify(item.meta, null, 2) : '');

  const handleSubmit = () => {
    const payload = {
      ...data,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      order: parseInt(data.order) || 0,
    };
    try {
      if (metaStr.trim()) {
        payload.meta = JSON.parse(metaStr);
      } else {
        payload.meta = {};
      }
    } catch (e) {
      alert('Meta information is not valid JSON!');
      return;
    }
    onSave(payload);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await api.post('/admin/ai/generate', { type, prompt: aiPrompt }, { headers });
      const generated = res.data;
      
      setData(prev => ({
        ...prev,
        ...generated,
        tags: Array.isArray(generated.tags) ? generated.tags.join(', ') : prev.tags
      }));
      
      if (generated.meta && (type === 'school' || type === 'course')) {
        setMetaStr(JSON.stringify(generated.meta, null, 2));
      }
      
      alert('AI đã tạo xong nội dung! Bạn hãy kiểm tra lại các trường phía dưới.');
      setAiPrompt('');
    } catch (err) {
      alert('AI Generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleUploadCertificateImage = async () => {
    if (!item?._id || type !== 'certificate' || !certImageFile) return;
    try {
      const fd = new FormData();
      fd.append('file', certImageFile);
      await api.post(`/admin/content/${item._id}/certificate-image`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setCertUploadStatus('Upload image thành công. Đã lưu vào DB.');
      setCertImageFile(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      setCertUploadStatus(`Upload lỗi: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{ background: 'rgba(59,130,246,0.05)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(59,130,246,0.15)' }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--ocean-sky)' }}>{item ? `✏️ Edit: ${item.title}` : `➕ Tạo ${type} mới`}</h4>
      
      {/* AI Assistant Section */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--ocean-blue)' }}>
        <h5 style={{ color: 'var(--ocean-sky)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span> AI Content Assistant
        </h5>
        <p style={{ fontSize: '0.8rem', color: 'var(--ocean-light)', marginBottom: '0.8rem' }}>
          Nhập mô tả thô (vd: tên trường, ngành học, những gì bạn đã học...) để AI tự động điền form.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <textarea
            className="form-textarea"
            style={{ flex: 1, minHeight: '60px', padding: '0.5rem', fontSize: '0.85rem' }}
            placeholder="Ví dụ: Đại học FPT, chuyên ngành Kỹ thuật phần mềm, học về React, Nodejs, có giải nhất hackathon..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ height: 'fit-content', padding: '0.6rem 1rem' }}
            onClick={handleAiGenerate}
            disabled={isAiGenerating || !aiPrompt.trim()}
          >
            {isAiGenerating ? 'Generating...' : '✨ Generate'}
          </button>
        </div>
      </div>

      <div className="admin-grid-2" style={{ gap: '0.75rem' }}>
        <div className="form-group">
          <label>Slug *</label>
          <input className="form-input" value={data.slug} onChange={e => setData(d => ({ ...d, slug: e.target.value }))} placeholder="my-project-slug" />
        </div>
        <div className="form-group">
          <label>Title *</label>
          <input className="form-input" value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Subtitle</label>
          <input className="form-input" value={data.subtitle} onChange={e => setData(d => ({ ...d, subtitle: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Icon (emoji)</label>
          <input className="form-input" value={data.icon} onChange={e => setData(d => ({ ...d, icon: e.target.value }))} placeholder="🔬" />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input className="form-input" value={data.category} onChange={e => setData(d => ({ ...d, category: e.target.value }))} placeholder="ai, web, research..." />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input className="form-input" value={data.date} onChange={e => setData(d => ({ ...d, date: e.target.value }))} placeholder="2026" />
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input className="form-input" value={data.tags} onChange={e => setData(d => ({ ...d, tags: e.target.value }))} placeholder="Python, PyTorch, CUDA" />
        </div>
        <div className="form-group">
          <label>GitHub URL</label>
          <input className="form-input" value={data.github} onChange={e => setData(d => ({ ...d, github: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Zenodo URL</label>
          <input className="form-input" value={data.zenodo} onChange={e => setData(d => ({ ...d, zenodo: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Paper URL</label>
          <input className="form-input" value={data.paper} onChange={e => setData(d => ({ ...d, paper: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Order</label>
          <input className="form-input" type="number" value={data.order} onChange={e => setData(d => ({ ...d, order: e.target.value }))} />
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={data.featured} onChange={e => setData(d => ({ ...d, featured: e.target.checked }))} /> Featured
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={data.visible} onChange={e => setData(d => ({ ...d, visible: e.target.checked }))} /> Visible
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={data.contentLocked} onChange={e => setData(d => ({ ...d, contentLocked: e.target.checked }))} /> Content Locked
          </label>
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '0.75rem' }}>
        <label>Description</label>
        <textarea className="form-textarea" value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))} />
      </div>
      {(type === 'school' || type === 'course') && (
        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <label>Meta (JSON for school/course details: highlights, programs, myJourney, stats, accent, ...)</label>
          <textarea className="form-textarea" style={{ minHeight: 200, fontFamily: 'monospace' }} value={metaStr} onChange={e => setMetaStr(e.target.value)} placeholder='{ "accent": "linear-gradient(...)", "highlights": [] }' />
        </div>
      )}
      <div className="form-group" style={{ marginTop: '0.75rem' }}>
        <label>README (Markdown)</label>
        <textarea className="form-textarea" style={{ minHeight: 200 }} value={data.readme} onChange={e => setData(d => ({ ...d, readme: e.target.value }))} placeholder="# Full README content..." />
      </div>
      {type === 'certificate' && item?._id && (
        <div className="form-group" style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(59,130,246,0.12)', paddingTop: '0.75rem' }}>
          <label>Ảnh chứng chỉ (lưu vào MongoDB)</label>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => setCertImageFile(e.target.files?.[0] || null)} />
          <div style={{ fontSize: '0.8rem', color: 'var(--ocean-light)', marginTop: '0.35rem' }}>
            Trạng thái: {item.certificateImageName ? 'Đã có ảnh trong DB' : 'Chưa có ảnh trong DB'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ocean-light)', marginTop: '0.25rem' }}>
            File: {item.certificateImageName || '—'}
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={handleUploadCertificateImage} disabled={!certImageFile}>
              Upload ảnh vào DB
            </button>
            <a
              href={`/api/content/certificate-image/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              Test URL ảnh
            </a>
            {certUploadStatus && <span style={{ fontSize: '0.8rem', color: 'var(--ocean-light)' }}>{certUploadStatus}</span>}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '0.5rem 1.5rem' }}>
          <Save size={16} /> {item ? 'Cập nhật' : 'Tạo mới'}
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          <X size={16} /> Hủy
        </button>
      </div>
    </div>
  );
}

export default AdminPage;
