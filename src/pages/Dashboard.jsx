import {
  AlertCircle,
  LogOut,
  QrCode,
  LayoutDashboard,
  List,
  PlusCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { useTicketListener } from '../hooks/useTicketListener';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sub-components
import DashboardOverview from '../components/DashboardOverview';
import TicketGenerator from '../components/TicketGenerator';
import ActiveTicketsList from '../components/ActiveTicketsList';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userDataStr = localStorage.getItem('user');
    return userDataStr ? JSON.parse(userDataStr) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [firestoreError, setFirestoreError] = useState(null);

  const [ticketsList, setTicketsList] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [appState, setAppState] = useState('idle');
  const [ticketData, setTicketData] = useState(null);
  const [vehicleType, setVehicleType] = useState('mobil');
  const [timeLeft, setTimeLeft] = useState(600);
  const [copied, setCopied] = useState(false);

  const [adminAreas, setAdminAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(localStorage.getItem('selectedAreaId') || '');
  const [loadingAreas, setLoadingAreas] = useState(false);

  const ticketId = ticketData?.ticketId || null;
  const { status: firestoreStatus } = useTicketListener(ticketId);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) { navigate('/login'); return; }
    const savedAreas = localStorage.getItem('adminAreas');
    if (savedAreas) {
      const areas = JSON.parse(savedAreas);
      setAdminAreas(areas);
      if (!selectedAreaId && areas.length > 0) {
        setSelectedAreaId(areas[0].id);
        localStorage.setItem('selectedAreaId', areas[0].id);
      }
    } else {
      setLoadingAreas(true);
      api.get('/areas')
        .then(res => {
          if (res.data?.data) {
            setAdminAreas(res.data.data);
            if (res.data.data.length > 0 && !selectedAreaId) {
              const defaultArea = res.data.data[0].id;
              setSelectedAreaId(defaultArea);
              localStorage.setItem('selectedAreaId', defaultArea);
            }
          }
        })
        .catch(err => console.error('Gagal fetch areas:', err))
        .finally(() => setLoadingAreas(false));
    }
  }, [navigate, user]);

  useEffect(() => {
    if (appState === 'generated' && firestoreStatus === 'claimed') {
      const t0 = setTimeout(() => setAppState('claimed'), 0);
      const t1 = setTimeout(() => { setAppState('idle'); setTicketData(null); }, 3000);
      return () => { clearTimeout(t0); clearTimeout(t1); };
    }
  }, [appState, firestoreStatus]);

  useEffect(() => {
    let interval = null, timeout0 = null;
    if (appState === 'generated' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (appState === 'generated' && timeLeft === 0) {
      timeout0 = setTimeout(() => { setAppState('idle'); setTicketData(null); }, 0);
    }
    return () => { if (interval) clearInterval(interval); if (timeout0) clearTimeout(timeout0); };
  }, [appState, timeLeft]);

  // Real-time tickets listener
  useEffect(() => {
    if (!selectedAreaId) return;
    setLoadingTickets(true);
    setFirestoreError(null);
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('areaId', '==', selectedAreaId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tickets = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tickets.push({
          id: docSnap.id,
          ...data
        });
      });
      // Sort client-side by createdAt descending
      tickets.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        return timeB - timeA;
      });
      setTicketsList(tickets);
      setLoadingTickets(false);
    }, (err) => {
      console.error("Gagal mendengarkan daftar tiket:", err);
      setFirestoreError(err.message || String(err));
      setLoadingTickets(false);
    });

    return () => unsubscribe();
  }, [selectedAreaId]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (err) { console.error(err); } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleGenerateTicket = async () => {
    if (!selectedAreaId) { alert('Silahkan pilih area terlebih dahulu.'); return; }
    setAppState('loading'); setTimeLeft(600); setCopied(false);
    try {
      const response = await api.post('/gate/generateTicket', { areaId: selectedAreaId, vehicleType });
      if (response.data?.data) {
        const generated = response.data.data;
        setTicketData(generated);
        setAppState('generated');
      }
      else throw new Error('Format respons tidak valid');
    } catch (err) {
      console.error('Gagal generate tiket:', err);
      alert(err.response?.data?.message || 'Gagal generate tiket');
      setAppState('idle');
    }
  };

  const handleCancelTicket = async (tId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan tiket ini?')) return;
    try {
      const ticketRef = doc(db, 'tickets', tId);
      await updateDoc(ticketRef, { status: 'cancelled' });
      alert('Tiket berhasil dibatalkan.');
    } catch (err) {
      console.error('Gagal membatalkan tiket:', err);
      alert('Gagal membatalkan tiket: ' + err.message);
    }
  };

  const handleCopyTicketCode = async () => {
    const code = ticketData?.qrCode || ticketData?.ticketId;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin kode tiket:', err);
    }
  };

  const handleCopyCustomCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Kode tiket berhasil disalin!');
    } catch (err) {
      console.error('Gagal menyalin kode tiket:', err);
    }
  };

  // Helper stats functions
  const getTodayTicketsCount = () => {
    const todayStr = new Date().toDateString();
    return ticketsList.filter(t => {
      let ticketDate;
      if (t.createdAt?.seconds) {
        ticketDate = new Date(t.createdAt.seconds * 1000);
      } else if (t.createdAt?.toDate) {
        ticketDate = t.createdAt.toDate();
      } else {
        ticketDate = new Date(t.createdAt || Date.now());
      }
      return ticketDate.toDateString() === todayStr;
    }).length;
  };

  const getActiveTicketsCount = () => {
    return ticketsList.filter(t => t.status === 'active' || t.status === 'pending').length;
  };

  const getClaimedTicketsCount = () => {
    return ticketsList.filter(t => t.status === 'claimed').length;
  };

  const renderStatusBadge = (status) => {
    let bg = 'rgba(74, 96, 128, 0.1)';
    let border = '1px solid rgba(74, 96, 128, 0.2)';
    let color = '#8BA3BC';
    let label = status;

    if (status === 'active' || status === 'pending') {
      bg = 'rgba(0, 210, 255, 0.1)';
      border = '1px solid rgba(0, 210, 255, 0.3)';
      color = '#00D2FF';
      label = 'Aktif';
    } else if (status === 'claimed') {
      bg = 'rgba(76, 175, 80, 0.1)';
      border = '1px solid rgba(76, 175, 80, 0.3)';
      color = '#4CAF50';
      label = 'Sukses';
    } else if (status === 'cancelled') {
      bg = 'rgba(239, 83, 80, 0.1)';
      border = '1px solid rgba(239, 83, 80, 0.3)';
      color = '#EF5350';
      label = 'Dibatalkan';
    } else if (status === 'expired') {
      bg = 'rgba(255, 152, 0, 0.1)';
      border = '1px solid rgba(255, 152, 0, 0.3)';
      color = '#FF9800';
      label = 'Kedaluwarsa';
    }

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        background: bg,
        border: border,
        color: color,
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
      }}>
        {label}
      </span>
    );
  };

  if (!user) return null;

  const isTimeRunningOut = timeLeft < 60;

  // ─── Common styles ───
  const S = {
    page: {
      minHeight: '100vh',
      background: '#0D1628',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    header: {
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(19,33,54,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1E3A5F',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '68px',
    },
    logoBox: {
      width: '38px', height: '38px',
      background: 'linear-gradient(135deg, #00D2FF, #0066AA)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,210,255,0.3)',
    },
    logoTitle: { fontSize: '18px', fontWeight: '800', color: '#fff', marginLeft: '10px' },
    select: {
      background: '#1A2D47',
      border: '1px solid #1E3A5F',
      color: '#00D2FF',
      borderRadius: '8px',
      padding: '4px 10px',
      fontSize: '13px', fontWeight: '600',
      cursor: 'pointer', outline: 'none',
      fontFamily: "'Inter', sans-serif",
      marginTop: '4px',
    },
    userInfo: { textAlign: 'right' },
    userName: { color: '#fff', fontWeight: '700', fontSize: '14px', margin: 0 },
    userRole: { color: '#8BA3BC', fontSize: '12px', textTransform: 'capitalize', margin: 0 },
    logoutBtn: {
      background: 'rgba(239,83,80,0.1)',
      border: '1px solid rgba(239,83,80,0.3)',
      borderRadius: '10px', padding: '8px 10px',
      color: '#EF5350', cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      transition: 'all 0.2s',
      marginLeft: '16px',
    },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={S.logoBox}>
            <QrCode style={{ color: '#fff', width: '20px', height: '20px' }} />
          </div>
          <div style={{ marginLeft: '12px' }}>
            <div style={S.logoTitle}>ParkFinder</div>
            <div>
              {loadingAreas ? (
                <span style={{ color: '#4A6080', fontSize: '12px' }}>Memuat area...</span>
              ) : adminAreas.length > 0 ? (
                <select
                  value={selectedAreaId}
                  onChange={e => { setSelectedAreaId(e.target.value); localStorage.setItem('selectedAreaId', e.target.value); }}
                  style={S.select}
                >
                  <option value="">Pilih Area...</option>
                  {adminAreas.map(area => (
                    <option key={area.id} value={area.id}>{area.name || area.id}</option>
                  ))}
                </select>
              ) : (
                <span style={{ color: '#EF5350', fontSize: '12px', fontWeight: '600' }}>Tidak ada area</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={S.userInfo}>
            <p style={S.userName}>{user.name}</p>
            <p style={S.userRole}>{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            style={S.logoutBtn}
            title="Keluar"
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,83,80,0.2)'; e.currentTarget.style.borderColor = '#EF5350'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,83,80,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,83,80,0.3)'; }}
          >
            <LogOut style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Main Content */}
      <div className="layout-container">
        
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'dashboard' ? 'sidebar-btn-active' : 'sidebar-btn-inactive'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard style={{ width: '18px', height: '18px' }} />
            Dashboard Ringkasan
          </button>

          <button
            className={`sidebar-btn ${activeTab === 'generate' ? 'sidebar-btn-active' : 'sidebar-btn-inactive'}`}
            onClick={() => setActiveTab('generate')}
          >
            <PlusCircle style={{ width: '18px', height: '18px' }} />
            Generate QR Tiket
          </button>

          <button
            className={`sidebar-btn ${activeTab === 'active-list' ? 'sidebar-btn-active' : 'sidebar-btn-inactive'}`}
            onClick={() => setActiveTab('active-list')}
          >
            <List style={{ width: '18px', height: '18px' }} />
            Daftar Tiket Aktif
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          
          {/* Warn if no area selected */}
          {!selectedAreaId && !loadingAreas && adminAreas.length > 0 && (
            <div style={{
              width: '100%', marginBottom: '24px',
              padding: '16px 20px',
              background: 'rgba(0,210,255,0.06)',
              border: '1px solid rgba(0,210,255,0.2)',
              borderRadius: '12px', color: '#8BA3BC',
              fontSize: '14px',
            }}>
              Silahkan pilih area dari dropdown di header untuk mengaktifkan fitur kontrol.
            </div>
          )}

          {/* Firestore connection error warning */}
          {firestoreError && (
            <div style={{
              width: '100%', marginBottom: '24px',
              padding: '16px 20px',
              background: 'rgba(239,83,80,0.1)',
              border: '1px solid rgba(239,83,80,0.3)',
              borderRadius: '12px', color: '#EF5350',
              fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <div>
                <strong>Gagal memuat data dari Firestore:</strong> {firestoreError}. 
                <span style={{ color: '#8BA3BC', marginLeft: '6px' }}>
                  Mohon pastikan environment variables Firebase di Vercel sudah di-set dengan benar, lalu redeploy project Anda.
                </span>
              </div>
            </div>
          )}

          {/* Loading areas */}
          {loadingAreas && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
              <div style={{
                width: '56px', height: '56px',
                border: '3px solid #1E3A5F',
                borderTopColor: '#00D2FF',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '20px',
              }} />
              <p style={{ color: '#8BA3BC', fontWeight: '600' }}>Memuat data area...</p>
            </div>
          )}

          {/* No areas warning */}
          {!loadingAreas && adminAreas.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 0' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(239,83,80,0.1)',
                border: '1px solid rgba(239,83,80,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <AlertCircle style={{ width: '36px', height: '36px', color: '#EF5350' }} />
              </div>
              <h2 style={{ color: '#fff', fontWeight: '800', fontSize: '22px', marginBottom: '8px' }}>Tidak ada area</h2>
              <p style={{ color: '#8BA3BC', marginBottom: '24px', fontSize: '14px', maxWidth: '360px' }}>
                Akun admin Anda belum terasosiasi dengan area gerbang parkir. Silahkan hubungi administrator utama.
              </p>
              <button onClick={handleLogout} style={{
                padding: '10px 24px', background: '#1A2D47',
                border: '1px solid #1E3A5F', borderRadius: '10px',
                color: '#8BA3BC', fontWeight: '600', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}>Logout</button>
            </div>
          )}

          {/* Render Active View */}
          {!loadingAreas && selectedAreaId && (
            <div>
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  ticketsList={ticketsList}
                  onNavigate={setActiveTab}
                  getTodayTicketsCount={getTodayTicketsCount}
                  getActiveTicketsCount={getActiveTicketsCount}
                  getClaimedTicketsCount={getClaimedTicketsCount}
                />
              )}

              {/* TAB 2: GENERATE FORM & QR CODE RESULT */}
              {activeTab === 'generate' && (
                <TicketGenerator
                  appState={appState}
                  setAppState={setAppState}
                  ticketData={ticketData}
                  setTicketData={setTicketData}
                  vehicleType={vehicleType}
                  handleGenerateTicket={handleGenerateTicket}
                  handleCopyTicketCode={handleCopyTicketCode}
                  copied={copied}
                  timeLeft={timeLeft}
                  formatTime={formatTime}
                  isTimeRunningOut={isTimeRunningOut}
                  selectedAreaName={adminAreas.find(a => a.id === selectedAreaId)?.name}
                />
              )}

              {/* TAB 3: ACTIVE TICKETS LIST */}
              {activeTab === 'active-list' && (
                <ActiveTicketsList
                  ticketsList={ticketsList}
                  loadingTickets={loadingTickets}
                  onNavigate={setActiveTab}
                  onCopyCode={handleCopyCustomCode}
                  onCancelTicket={handleCancelTicket}
                />
              )}

            </div>
          )}
        </main>
      </div>

      <style>{`
        /* General layout classes */
        .layout-container {
          display: flex;
          flex-direction: row;
          min-height: calc(100vh - 68px);
        }
        
        .sidebar {
          width: 260px;
          background: #132136;
          border-right: 1px solid #1E3A5F;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }

        .sidebar-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid transparent;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          width: 100%;
        }

        .sidebar-btn-active {
          background: linear-gradient(135deg, rgba(0, 210, 255, 0.15), rgba(0, 102, 170, 0.25));
          border: 1px solid rgba(0, 210, 255, 0.3) !important;
          color: #00D2FF;
          font-weight: 700;
        }

        .sidebar-btn-inactive {
          background: transparent;
          color: #8BA3BC;
          font-weight: 600;
        }

        .sidebar-btn-inactive:hover {
          background: rgba(30, 58, 95, 0.4);
          color: #fff;
        }

        .main-content {
          flex: 1;
          padding: 32px;
          background: #0D1628;
          overflow-y: auto;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stats-card {
          background: #132136;
          border: 1px solid #1E3A5F;
          border-radius: 18px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0,210,255,0.1);
        }

        .stats-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        /* Grid sections */
        .dashboard-sections {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        .section-card {
          background: #132136;
          border: 1px solid #1E3A5F;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        /* Form styling */
        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
        }

        .form-label {
          color: #8BA3BC;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          text-align: left;
        }

        .form-input {
          padding: 14px 16px;
          background: #1A2D47;
          border: 1.5px solid #1E3A5F;
          border-radius: 12px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: rgba(0, 210, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(0, 210, 255, 0.1);
        }

        /* Vehicle Selector */
        .vehicle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 5px;
        }

        .vehicle-card {
          border: 1px solid #1E3A5F;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #1A2D47;
          color: #8BA3BC;
        }

        .vehicle-card-active {
          background: linear-gradient(135deg, rgba(0, 210, 255, 0.08), rgba(0, 102, 170, 0.15));
          border-color: #00D2FF;
          color: #00D2FF;
          font-weight: 700;
          box-shadow: 0 0 15px rgba(0, 210, 255, 0.15);
        }

        /* Table styling */
        .custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .custom-table th {
          padding: 12px 16px;
          border-bottom: 1.5px solid #1E3A5F;
          color: #8BA3BC;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .custom-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(30, 58, 95, 0.5);
          color: #fff;
          font-size: 14px;
        }

        .custom-table tr:hover td {
          background: rgba(26, 45, 71, 0.4);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        /* Responsive styling */
        @media (max-width: 992px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .layout-container {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #1E3A5F;
            flex-direction: row;
            overflow-x: auto;
            padding: 12px 16px;
            white-space: nowrap;
            gap: 12px;
          }
          .sidebar-btn {
            width: auto;
            padding: 8px 14px;
            font-size: 13px;
            gap: 8px;
          }
          .main-content {
            padding: 20px 16px;
          }
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .custom-table th, .custom-table td {
            padding: 10px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;