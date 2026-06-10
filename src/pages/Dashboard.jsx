import {
  AlertCircle,
  LogOut,
  QrCode
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { useTicketListener } from '../hooks/useTicketListener';
// Sub-components
import TicketGenerator from '../components/TicketGenerator';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userDataStr = localStorage.getItem('user');
    return userDataStr ? JSON.parse(userDataStr) : null;
  });

  const [appState, setAppState] = useState('idle');
  const [ticketData, setTicketData] = useState(null);
  const [vehicleType] = useState('mobil');
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

      {/* Main Layout: Main Content Only (No Sidebar) */}
      <div className="layout-container" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          
          {/* Warn if no area selected */}
          {!selectedAreaId && !loadingAreas && adminAreas.length > 0 && (
            <div style={{
              width: '100%', marginBottom: '24px',
              padding: '16px 20px',
              background: 'rgba(0,210,255,0.06)',
              border: '1px solid rgba(0,210,255,0.2)',
              borderRadius: '12px', color: '#8BA3BC',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Silahkan pilih area dari dropdown di header untuk mengaktifkan fitur kontrol.
            </div>
          )}

          {/* Loading areas */}
          {loadingAreas && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', flex: 1 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 0', flex: 1 }}>
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

          {/* Render Generator Component directly */}
          {!loadingAreas && selectedAreaId && (
            <div style={{ width: '100%' }}>
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

        .main-content {
          flex: 1;
          padding: 32px;
          background: #0D1628;
          overflow-y: auto;
        }

        .section-card {
          background: #132136;
          border: 1px solid #1E3A5F;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .main-content {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;