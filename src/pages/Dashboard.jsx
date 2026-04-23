import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, QrCode, CheckCircle, Car, Bike } from 'lucide-react';
import api from '../config/axios';
import { useTicketListener } from '../hooks/useTicketListener';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userDataStr = localStorage.getItem('user');
    return userDataStr ? JSON.parse(userDataStr) : null;
  });
  
  // App state: 'idle' | 'loading' | 'generated' | 'claimed'
  const [appState, setAppState] = useState('idle');
  const [ticketData, setTicketData] = useState(null);
  const [vehicleType, setVehicleType] = useState('motor');
  
  const ticketId = ticketData?.ticketId || null;
  const { status: firestoreStatus } = useTicketListener(ticketId);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token || !user) {
      navigate('/login');
    }
  }, [navigate, user]);

  // Monitor firestore status
  useEffect(() => {
    if (appState === 'generated' && firestoreStatus === 'claimed') {
      const timer0 = setTimeout(() => {
        setAppState('claimed');
      }, 0);
      
      // Reset back to idle after 3 seconds
      const timer = setTimeout(() => {
        setAppState('idle');
        setTicketData(null);
      }, 3000);
      
      return () => {
        clearTimeout(timer0);
        clearTimeout(timer);
      };
    }
  }, [appState, firestoreStatus]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleGenerateTicket = async () => {
    if (!user?.managedAreaId) {
      alert('Admin tidak memiliki area yang diurus.');
      return;
    }

    setAppState('loading');
    
    try {
      const response = await api.post('/gate/generateTicket', {
        areaId: user.managedAreaId,
        vehicleType
      });
      
      if (response.data?.data) {
        setTicketData(response.data.data);
        setAppState('generated');
      } else {
        throw new Error('Format response invalid');
      }
    } catch (err) {
      console.error('Failed to generate ticket', err);
      alert(err.response?.data?.message || 'Gagal generate tiket');
      setAppState('idle');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 py-5 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-900 p-2.5 rounded-xl shadow-sm rotate-3">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gate Display</h1>
            <p className="text-sm text-gray-500 font-medium">Area: <span className="text-gray-900">{user.managedAreaId}</span></p>
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
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-2xl p-10 sm:p-12 min-h-[500px] flex flex-col relative overflow-hidden">
          
          {/* Top Controls (Visible when not claimed/loading) */}
          {(appState === 'idle' || appState === 'generated') && (
             <div className="flex justify-center space-x-4 mb-10">
              <button 
                onClick={() => setVehicleType('motor')}
                className={`flex items-center px-8 py-3.5 rounded-2xl font-bold transition-all duration-200 ${vehicleType === 'motor' ? 'bg-gray-900 text-white shadow-md hover:-translate-y-0.5' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <Bike className="w-5 h-5 mr-2.5" />
                Motor
              </button>
              <button 
                onClick={() => setVehicleType('mobil')}
                className={`flex items-center px-8 py-3.5 rounded-2xl font-bold transition-all duration-200 ${vehicleType === 'mobil' ? 'bg-gray-900 text-white shadow-md hover:-translate-y-0.5' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <Car className="w-5 h-5 mr-2.5" />
                Mobil
              </button>
            </div>
          )}

          {/* Dynamic Area Display */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            
            {appState === 'idle' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <QrCode className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Siap Menerima Pengunjung</h2>
                <p className="text-gray-500 font-medium mb-10 max-w-md">
                  Pilih tipe kendaraan di atas, lalu tekan tombol di bawah untuk menghasilkan QR Code tiket.
                </p>
                <button
                  onClick={handleGenerateTicket}
                  className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_25px_rgb(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
                >
                  Generate QR Ticket
                </button>
              </div>
            )}

            {appState === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-[3px] border-gray-100 border-t-gray-900 rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight animate-pulse">Menghasilkan Tiket...</h2>
              </div>
            )}

            {appState === 'generated' && ticketData && (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mb-8 transition-transform hover:scale-105 duration-500">
                  <QRCodeSVG 
                    value={ticketData.qrCode} 
                    size={280}
                    level="H"
                    includeMargin={false}
                    className="rounded-xl"
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Scan QR Code Ini</h2>
                <p className="text-gray-500 font-medium text-lg">Silakan scan menggunakan aplikasi Parkfinder</p>
                <button 
                  onClick={() => { setAppState('idle'); setTicketData(null); }}
                  className="mt-8 px-6 py-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all duration-200"
                >
                  Batalkan
                </button>
              </div>
            )}

            {appState === 'claimed' && (
              <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
                <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Sukses!</h2>
                <p className="text-green-600 text-xl font-bold">Silakan Masuk</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
