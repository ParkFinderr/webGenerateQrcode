import { AlertCircle, CarFront, CheckCircle, LogOut, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { useTicketListener } from '../hooks/useTicketListener';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userDataStr = localStorage.getItem('user');
    return userDataStr ? JSON.parse(userDataStr) : null;
  });

  const [appState, setAppState] = useState('idle');
  const [ticketData, setTicketData] = useState(null);
  const [vehicleType, setVehicleType] = useState('mobil');
  const [timeLeft, setTimeLeft] = useState(600);

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
    setAppState('loading'); setTimeLeft(600);
    try {
      const response = await api.post('/gate/generateTicket', { areaId: selectedAreaId, vehicleType });
      if (response.data?.data) { setTicketData(response.data.data); setAppState('generated'); }
      else throw new Error('Format respons tidak valid');
    } catch (err) {
      console.error('Gagal generate tiket:', err);
      alert(err.response?.data?.message || 'Gagal generate tiket');
      setAppState('idle');
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
    main: {
      flex: 1, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    },
    card: {
      width: '100%', maxWidth: '480px',
      background: '#132136',
      border: '1px solid #1E3A5F',
      borderRadius: '24px',
      padding: '40px 36px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      minHeight: '500px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    },
    topGlow: {
      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: '240px', height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.5), transparent)',
    },
    tabBar: {
      display: 'flex',
      background: '#0D1628',
      borderRadius: '12px', padding: '4px',
      width: '100%', marginBottom: '32px',
      border: '1px solid #1E3A5F',
    },
    tabActive: {
      flex: 1, padding: '10px', borderRadius: '8px',
      background: 'linear-gradient(135deg, #00D2FF22, #0066AA22)',
      border: '1px solid rgba(0,210,255,0.3)',
      color: '#00D2FF', fontWeight: '700', fontSize: '14px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      fontFamily: "'Inter', sans-serif",
    },
    tabInactive: {
      flex: 1, padding: '10px', borderRadius: '8px',
      background: 'transparent', border: 'none',
      color: '#4A6080', fontWeight: '600', fontSize: '14px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      fontFamily: "'Inter', sans-serif",
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

      {/* Main */}
      <main style={S.main}>
        <div style={S.card}>
          <div style={S.topGlow} />

          {/* Pilih area dulu */}
          {!selectedAreaId && !loadingAreas && adminAreas.length > 0 && (
            <div style={{
              width: '100%', marginBottom: '24px',
              padding: '14px 16px',
              background: 'rgba(0,210,255,0.06)',
              border: '1px solid rgba(0,210,255,0.2)',
              borderRadius: '12px', color: '#8BA3BC',
              fontSize: '14px',
            }}>
              Silahkan pilih area dari dropdown di atas untuk memulai generate tiket.
            </div>
          )}

          {/* Loading areas */}
          {loadingAreas && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '56px', height: '56px',
                border: '3px solid #1E3A5F',
                borderTopColor: '#00D2FF',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '20px',
              }} />
              <p style={{ color: '#8BA3BC', fontWeight: '600' }}>Memuat area...</p>
            </div>
          )}

          {/* No areas */}
          {!loadingAreas && adminAreas.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
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
              <p style={{ color: '#8BA3BC', marginBottom: '24px', fontSize: '14px' }}>
                Admin tidak memiliki area untuk dikelola. Hubungi administrator.
              </p>
              <button onClick={handleLogout} style={{
                padding: '10px 24px', background: '#1A2D47',
                border: '1px solid #1E3A5F', borderRadius: '10px',
                color: '#8BA3BC', fontWeight: '600', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}>Logout</button>
            </div>
          )}

          {/* Tab bar vehicle type */}
          {(appState === 'idle' || appState === 'generated') && !loadingAreas && selectedAreaId && (
            <div style={S.tabBar}>
              <button
                style={vehicleType === 'mobil' ? S.tabActive : S.tabInactive}
                onClick={() => setVehicleType('mobil')}
              >
                <CarFront style={{ width: '16px', height: '16px' }} />
                Mobil
              </button>
            </div>
          )}

          {/* Content area */}
          {!loadingAreas && selectedAreaId && (
            <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

              {/* IDLE */}
              {appState === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', animation: 'fadeUp 0.4s ease' }}>
                  <div style={{
                    width: '96px', height: '96px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0,210,255,0.1), rgba(0,102,170,0.15))',
                    border: '1px solid rgba(0,210,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 0 40px rgba(0,210,255,0.1)',
                  }}>
                    <QrCode style={{ width: '44px', height: '44px', color: '#00D2FF' }} />
                  </div>
                  <h2 style={{ color: '#fff', fontWeight: '800', fontSize: '24px', marginBottom: '8px' }}>Siap Melayani</h2>
                  <p style={{ color: '#8BA3BC', marginBottom: '36px', fontSize: '14px' }}>
                    Tekan tombol di bawah untuk membuat tiket QR parkir.
                  </p>
                  <button
                    onClick={handleGenerateTicket}
                    style={{
                      width: '100%', padding: '16px',
                      background: 'linear-gradient(135deg, #00D2FF, #0066AA)',
                      border: 'none', borderRadius: '14px',
                      color: '#fff', fontSize: '16px', fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(0,210,255,0.3)',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,210,255,0.45)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,210,255,0.3)'; }}
                  >
                    Buat Tiket QR
                  </button>
                </div>
              )}

              {/* LOADING */}
              {appState === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px',
                    border: '3px solid #1E3A5F',
                    borderTopColor: '#00D2FF',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    marginBottom: '20px',
                  }} />
                  <p style={{ color: '#8BA3BC', fontWeight: '600', fontSize: '15px' }}>Menghasilkan Tiket...</p>
                </div>
              )}

              {/* GENERATED */}
              {appState === 'generated' && ticketData && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', animation: 'fadeUp 0.4s ease' }}>
                  {/* QR card */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                    position: 'relative',
                  }}>
                    <QRCodeSVG
                      value={ticketData.qrCode || ticketData.ticketId}
                      size={220}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Timer */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 24px',
                    background: isTimeRunningOut ? 'rgba(239,83,80,0.12)' : 'rgba(0,210,255,0.08)',
                    border: `1px solid ${isTimeRunningOut ? 'rgba(239,83,80,0.3)' : 'rgba(0,210,255,0.2)'}`,
                    borderRadius: '24px',
                    marginBottom: '20px',
                    color: isTimeRunningOut ? '#EF5350' : '#00D2FF',
                    fontWeight: '700', fontSize: '16px',
                  }}>
                    {isTimeRunningOut && <AlertCircle style={{ width: '18px', height: '18px' }} />}
                    Sisa Waktu: {formatTime(timeLeft)}
                  </div>

                  <button
                    onClick={handleGenerateTicket}
                    style={{
                      background: 'transparent', border: 'none',
                      color: '#4A6080', fontSize: '14px', fontWeight: '600',
                      cursor: 'pointer', textDecoration: 'underline',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Batalkan &amp; Refresh
                  </button>
                </div>
              )}

              {/* CLAIMED */}
              {appState === 'claimed' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
                  <div style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'rgba(76,175,80,0.1)',
                    border: '2px solid rgba(76,175,80,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 0 40px rgba(76,175,80,0.2)',
                  }}>
                    <CheckCircle style={{ width: '60px', height: '60px', color: '#4CAF50' }} />
                  </div>
                  <h2 style={{ color: '#fff', fontWeight: '900', fontSize: '32px', marginBottom: '8px' }}>Sukses!</h2>
                  <div style={{
                    background: 'rgba(76,175,80,0.1)',
                    border: '1px solid rgba(76,175,80,0.2)',
                    borderRadius: '24px', padding: '8px 24px',
                    color: '#4CAF50', fontWeight: '700', fontSize: '16px',
                  }}>
                    Gerbang Terbuka
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Dashboard;