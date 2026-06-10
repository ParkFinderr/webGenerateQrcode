import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, QrCode, CheckCircle, CarFront, AlertCircle, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const ticketId = ticketData?.ticketId || null;
  const { status: firestoreStatus } = useTicketListener(ticketId);

  const handleCopyTicketCode = async () => {
    if (!ticketData?.qrCode) return;
    try {
      await navigator.clipboard.writeText(ticketData.qrCode);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy ticket code:', err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      navigate('/login');
    }
  }, [navigate, user]);

  useEffect(() => {
    if (appState === 'generated' && firestoreStatus === 'claimed') {
      const timer0 = setTimeout(() => {
        setAppState('claimed');
      }, 0);

      const timer1 = setTimeout(() => {
        setAppState('idle');
        setTicketData(null);
      }, 3000);

      return () => {
        clearTimeout(timer0);
        clearTimeout(timer1);
      };
    }
  }, [appState, firestoreStatus]);

  useEffect(() => {
    let interval = null;
    let timeout0 = null;

    if (appState === 'generated' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (appState === 'generated' && timeLeft === 0) {
      timeout0 = setTimeout(() => {
        setAppState('idle');
        setTicketData(null);
      }, 0);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout0) clearTimeout(timeout0);
    };
  }, [appState, timeLeft]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleGenerateTicket = async () => {
    if (!user?.managedAreaId) {
      alert('Admin tidak memiliki area yang dikelola.');
      return;
    }

    setAppState('loading');
    setTimeLeft(600);
    setCopied(false);
    try {
      const response = await api.post('/gate/generateTicket', {
        areaId: user.managedAreaId,
        vehicleType
      });

      if (response.data?.data) {
        setTicketData(response.data.data);
        setAppState('generated');
      } else {
        throw new Error('Format respons tidak valid');
      }
    } catch (err) {
      console.error('Gagal generate tiket:', err);
      alert(err.response?.data?.message || 'Gagal generate tiket');
      setAppState('idle');
    }
  };

  if (!user) return null;

  const isTimeRunningOut = timeLeft < 60;

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col font-sans selection:bg-emerald-200">
      {/* Header Navigation */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-10 px-6 sm:px-10 py-4 flex justify-between items-center shadow-sm border-b border-emerald-50">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-600/20">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ParkFinder</h1>
            <p className="text-sm text-emerald-600 font-semibold flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Area: {user.managedAreaId}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize font-medium">{user.role}</p>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* konten utama */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-emerald-50/50 w-full max-w-lg p-8 sm:p-12 min-h-[550px] flex flex-col relative overflow-hidden">

          {(appState === 'idle' || appState === 'generated') && (
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-10 mx-auto w-full max-w-sm shadow-inner">
              {/* <button
                onClick={() => setVehicleType('motor')}
                className={`flex-1 flex justify-center items-center py-3 rounded-xl font-bold transition-all duration-300 ${vehicleType === 'motor' ? 'bg-white text-emerald-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Bike className={`w-5 h-5 mr-2 ${vehicleType === 'motor' ? 'text-emerald-500' : ''}`} />
                Motor
              </button> */}
              <button
                onClick={() => setVehicleType('mobil')}
                className={`flex-1 flex justify-center items-center py-3 rounded-xl font-bold transition-all duration-300 ${vehicleType === 'mobil' ? 'bg-white text-emerald-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <CarFront className={`w-5 h-5 mr-2 ${vehicleType === 'mobil' ? 'text-emerald-500' : ''}`} />
                Mobil
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center text-center">

            {/* Tampilan IDLE */}
            {appState === 'idle' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 w-full">
                <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <QrCode className="w-14 h-14 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Siap Melayani</h2>
                <p className="text-gray-500 font-medium mb-10 max-w-xs">
                  Silahkan Scan QR Code untuk Parkir.
                </p>
                <button
                  onClick={handleGenerateTicket}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-8 rounded-2xl text-lg shadow-[0_10px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.35)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
                >
                  Buat Tiket QR
                </button>
              </div>
            )}

            {/* Tampilan LOADING */}
            {appState === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-4 border-emerald-50 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight animate-pulse">Menghasilkan Tiket...</h2>
              </div>
            )}

            {/* Tampilan GENERATED (Kartu QR) */}
            {appState === 'generated' && ticketData && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full mt-2">
                <div className="bg-white p-5 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 mb-8 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="absolute -left-4 top-1/2 -mt-4 w-8 h-8 bg-[#F4F7F6] rounded-full border-r border-gray-100"></div>
                  <div className="absolute -right-4 top-1/2 -mt-4 w-8 h-8 bg-[#F4F7F6] rounded-full border-l border-gray-100"></div>

                  <div className="border-4 border-emerald-50 rounded-3xl p-4">
                    <QRCodeSVG
                      value={ticketData.qrCode}
                      size={240}
                      level="H"
                      includeMargin={true}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-col items-center w-full">
                    <span className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-2">Kode Tiket</span>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-3 w-full group hover:border-emerald-200 transition-all duration-300">
                      <span className="font-mono text-sm font-semibold text-gray-600 break-all select-all text-left flex-1 mr-3 pr-2">
                        {ticketData.qrCode}
                      </span>
                      <button
                        onClick={handleCopyTicketCode}
                        className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
                          copied
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-sm'
                        }`}
                        title="Salin Kode Tiket"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center px-6 py-3 rounded-full mb-6 font-bold text-lg transition-colors duration-300 ${isTimeRunningOut ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-700'}`}>
                  {isTimeRunningOut && <AlertCircle className="w-5 h-5 mr-2" />}
                  Sisa Waktu: {formatTime(timeLeft)}
                </div>

                <button
                  onClick={handleGenerateTicket}
                  className="text-gray-400 hover:text-gray-700 font-semibold underline underline-offset-4 transition-colors"
                >
                  Batalkan & Refresh
                </button>
              </div>
            )}

            {/* Tampilan CLAIMED (Sukses) */}
            {appState === 'claimed' && (
              <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
                <div className="w-40 h-40 bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 border-[6px] border-emerald-400 rounded-full animate-ping opacity-30"></div>
                  <CheckCircle className="w-20 h-20 text-emerald-500" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Sukses!</h2>
                <p className="text-emerald-600 text-xl font-bold bg-emerald-50 px-6 py-2 rounded-full">Gerbang Terbuka</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;