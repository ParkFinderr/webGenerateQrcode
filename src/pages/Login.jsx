import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { LogIn, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-teal-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] border border-emerald-50">

        {/* logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-100/50 rounded-3xl flex items-center justify-center shadow-inner">
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300 shadow-lg shadow-emerald-600/30">
              <ShieldCheck className="text-white w-8 h-8" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">ParkFinder</h2>
          <p className="text-emerald-600 font-medium mt-1">Akses Gerbang Utama</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
              placeholder="admin@parkfinder.id"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 flex items-center justify-center py-4 px-4 rounded-2xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 shadow-lg shadow-emerald-600/30 transition-all duration-300 ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1 active:translate-y-0'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Masuk Sistem
                <LogIn className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;