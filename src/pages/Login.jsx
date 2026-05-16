import { LogIn, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

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
        try {
          const areasResponse = await api.get('/areas', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (areasResponse.data?.data) {
            localStorage.setItem('adminAreas', JSON.stringify(areasResponse.data.data));
            if (user.managedAreaId) {
              localStorage.setItem('selectedAreaId', user.managedAreaId);
            } else if (areasResponse.data.data.length > 0) {
              localStorage.setItem('selectedAreaId', areasResponse.data.data[0].id);
            }
          }
        } catch (areaErr) {
          console.warn('Gagal fetch areas:', areaErr);
        }
        navigate('/');
      } else {
        setError(response.data.message || 'Login gagal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D1628 0%, #132136 50%, #0D1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Background glow effect */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,210,255,0.08), transparent)',
      }} />

      <div style={{
        width: '100%', maxWidth: '440px',
        background: '#132136',
        border: '1px solid #1E3A5F',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,210,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle top glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '200px', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.4), transparent)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(0,102,170,0.2))',
            border: '1px solid rgba(0,210,255,0.25)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, #00D2FF, #0066AA)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,210,255,0.3)',
            }}>
              <ShieldCheck style={{ color: '#fff', width: '26px', height: '26px' }} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: '800',
            color: '#ffffff', letterSpacing: '-0.5px', margin: 0,
          }}>ParkFinder</h1>
          <p style={{
            color: '#00D2FF', fontWeight: '500', marginTop: '6px', fontSize: '14px',
          }}>Akses Gerbang Parkir</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '20px', padding: '12px 16px',
            background: 'rgba(239,83,80,0.12)',
            border: '1px solid rgba(239,83,80,0.35)',
            borderRadius: '10px', color: '#EF5350',
            fontSize: '14px', fontWeight: '500',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block', marginBottom: '8px',
              color: '#8BA3BC', fontSize: '13px', fontWeight: '600',
            }}>Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@parkfinder.id"
              required
              style={{
                width: '100%', padding: '14px 16px',
                background: '#1A2D47',
                border: '1.5px solid #1E3A5F',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '15px', fontWeight: '500',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,210,255,0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,210,255,0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#1E3A5F';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block', marginBottom: '8px',
              color: '#8BA3BC', fontSize: '13px', fontWeight: '600',
            }}>Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '14px 16px',
                background: '#1A2D47',
                border: '1.5px solid #1E3A5F',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '15px', fontWeight: '500',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,210,255,0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,210,255,0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#1E3A5F';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              width: '100%', padding: '15px',
              background: loading ? '#0066AA' : 'linear-gradient(135deg, #00D2FF, #0066AA)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 8px 20px rgba(0,210,255,0.25)',
              transition: 'all 0.2s',
              fontFamily: "'Inter', sans-serif",
              opacity: loading ? 0.75 : 1,
            }}
            onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,210,255,0.35)'; } }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,210,255,0.25)'; }}
          >
            {loading ? (
              <div style={{
                width: '20px', height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <>
                Masuk
                <LogIn style={{ width: '18px', height: '18px' }} />
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;