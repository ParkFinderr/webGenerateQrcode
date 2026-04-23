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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Gate Display</h1>
            <p className="text-sm text-gray-500">Area: {user.managedAreaId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 min-h-[500px] flex flex-col relative overflow-hidden">
          
          {/* Top Controls (Visible when not claimed/loading) */}
          {(appState === 'idle' || appState === 'generated') && (
             <div className="flex justify-center space-x-4 mb-8">
              <button 
                onClick={() => setVehicleType('motor')}
                className={`flex items-center px-6 py-3 rounded-xl border-2 font-medium transition-all ${vehicleType === 'motor' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Bike className="w-5 h-5 mr-2" />
                Motor
              </button>
              <button 
                onClick={() => setVehicleType('mobil')}
                className={`flex items-center px-6 py-3 rounded-xl border-2 font-medium transition-all ${vehicleType === 'mobil' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Car className="w-5 h-5 mr-2" />
                Mobil
              </button>
            </div>
          )}

          {/* Dynamic Area Display */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            
            {appState === 'idle' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <QrCode className="w-16 h-16 text-blue-500 opacity-50" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Siap Menerima Pengunjung</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                  Pilih tipe kendaraan di atas, lalu tekan tombol di bawah untuk menghasilkan QR Code tiket.
                </p>
                <button
                  onClick={handleGenerateTicket}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  Generate QR Ticket
                </button>
              </div>
            )}

            {appState === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-800 animate-pulse">Menghasilkan Tiket...</h2>
              </div>
            )}

            {appState === 'generated' && ticketData && (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
                  <QRCodeSVG 
                    value={ticketData.qrCode} 
                    size={300}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Scan QR Code Ini</h2>
                <p className="text-gray-500 text-lg">Silakan scan menggunakan aplikasi Parkfinder</p>
                <button 
                  onClick={() => { setAppState('idle'); setTicketData(null); }}
                  className="mt-6 text-gray-400 hover:text-gray-600 underline"
                >
                  Batal / Kembali
                </button>
              </div>
            )}

            {appState === 'claimed' && (
              <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
                <div className="w-40 h-40 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <CheckCircle className="w-24 h-24 text-green-500" />
                </div>
                <h2 className="text-4xl font-black text-green-600 mb-2">Sukses!</h2>
                <p className="text-gray-600 text-xl font-medium">Silakan Masuk</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
