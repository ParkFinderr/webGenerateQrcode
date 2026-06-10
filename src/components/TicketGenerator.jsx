import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CarFront,
  PlusCircle,
  Copy,
  Check,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const TicketGenerator = ({
  appState,
  setAppState,
  ticketData,
  setTicketData,
  vehicleType,
  handleGenerateTicket,
  handleCopyTicketCode,
  copied,
  timeLeft,
  formatTime,
  isTimeRunningOut,
  selectedAreaName
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        
        {/* FORM VIEW */}
        {appState === 'idle' && (
          <div className="section-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '240px', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.5), transparent)',
            }} />
            
            <h2 style={{ color: '#fff', fontWeight: '800', fontSize: '22px', marginBottom: '6px', textAlign: 'center' }}>
              Generate QR Tiket
            </h2>
            <p style={{ color: '#8BA3BC', fontSize: '13px', marginBottom: '24px', textAlign: 'center' }}>
              Klik tombol di bawah untuk menghasilkan tiket masuk mobil secara instan.
            </p>

            <button
              onClick={handleGenerateTicket}
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #00D2FF, #0066AA)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontSize: '15px', fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,210,255,0.3)',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,210,255,0.45)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,210,255,0.3)'; }}
            >
              <CarFront style={{ width: '18px', height: '18px' }} />
              Generate Tiket Mobil
            </button>
          </div>
        )}

        {/* LOADING VIEW */}
        {appState === 'loading' && (
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
            <div style={{
              width: '56px', height: '56px',
              border: '3px solid #1E3A5F',
              borderTopColor: '#00D2FF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '20px',
            }} />
            <p style={{ color: '#8BA3BC', fontWeight: '600' }}>Menghasilkan Tiket...</p>
          </div>
        )}

        {/* QR CODE RESULT VIEW */}
        {appState === 'generated' && ticketData && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', animation: 'fadeUp 0.4s ease' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              position: 'relative',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1px solid #E2E8F0',
            }}>
              <div style={{
                position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                background: '#132136', width: '40px', height: '12px', borderRadius: '0 0 10px 10px',
              }} />

              <div style={{ textAlign: 'center', marginBottom: '16px', width: '100%' }}>
                <h4 style={{ color: '#0066AA', fontWeight: '800', fontSize: '16px', margin: 0, letterSpacing: '1px' }}>
                  PARKFINDER E-TICKET
                </h4>
                <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {selectedAreaName || 'Gate Area'}
                </span>
              </div>

              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                marginBottom: '16px',
              }}>
                <QRCodeSVG
                  value={ticketData.qrCode || ticketData.ticketId}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div style={{
                width: '100%', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0',
                padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B', fontWeight: '500' }}>Kendaraan</span>
                  <span style={{ color: '#1E293B', fontWeight: '700', textTransform: 'capitalize' }}>
                    {ticketData.vehicleType || vehicleType}
                  </span>
                </div>
                {ticketData.plateNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>Plat Nomor</span>
                    <span style={{ color: '#1E293B', fontWeight: '700' }}>{ticketData.plateNumber}</span>
                  </div>
                )}
                {ticketData.visitorName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>Pengunjung</span>
                    <span style={{ color: '#1E293B', fontWeight: '700' }}>{ticketData.visitorName}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B', fontWeight: '500' }}>Dibuat Pada</span>
                  <span style={{ color: '#1E293B', fontWeight: '700' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              <div style={{
                width: '100%',
                height: '1px',
                borderTop: '1px dashed #CBD5E1',
                margin: '8px 0 16px 0',
              }} />

              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  KODE TIKET (TAP UNTUK SALIN)
                </span>
                <div
                  onClick={handleCopyTicketCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: copied ? '#DCFCE7' : '#F1F5F9',
                    border: `1px solid ${copied ? '#4CAF50' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: '10px 14px',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: copied ? '#15803D' : '#1E293B',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {ticketData.qrCode || ticketData.ticketId}
                  </span>
                  {copied ? (
                    <Check style={{ width: '16px', height: '16px', color: '#16A34A' }} />
                  ) : (
                    <Copy style={{ width: '16px', height: '16px', color: '#475569' }} />
                  )}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 24px',
              background: isTimeRunningOut ? 'rgba(239,83,80,0.12)' : 'rgba(0,210,255,0.08)',
              border: `1px solid ${isTimeRunningOut ? 'rgba(239,83,80,0.3)' : 'rgba(0,210,255,0.2)'}`,
              borderRadius: '24px',
              marginBottom: '20px',
              color: isTimeRunningOut ? '#EF5350' : '#00D2FF',
              fontWeight: '700', fontSize: '15px',
            }}>
              {isTimeRunningOut && <AlertCircle style={{ width: '16px', height: '16px' }} />}
              Sisa Waktu: {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button
                onClick={async () => {
                  if (ticketData?.ticketId) {
                    try {
                      const ticketRef = doc(db, 'tickets', ticketData.ticketId);
                      await updateDoc(ticketRef, { status: 'cancelled' });
                    } catch (err) {
                      console.error(err);
                    }
                  }
                  setAppState('idle');
                  setTicketData(null);
                }}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#EF5350', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', textDecoration: 'underline',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Batalkan Tiket
              </button>
              <span style={{ color: '#4A6080' }}>|</span>
              <button
                onClick={() => {
                  setAppState('idle');
                  setTicketData(null);
                }}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#4A6080', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', textDecoration: 'underline',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Selesai &amp; Buat Baru
              </button>
            </div>
          </div>
        )}

        {/* CLAIMED VIEW */}
        {appState === 'claimed' && (
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px', animation: 'fadeUp 0.4s ease' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'rgba(76,175,80,0.1)',
              border: '2px solid rgba(76,175,80,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 0 30px rgba(76,175,80,0.2)',
            }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: '#4CAF50' }} />
            </div>
            <h2 style={{ color: '#fff', fontWeight: '900', fontSize: '28px', marginBottom: '8px' }}>Sukses!</h2>
            <div style={{
              background: 'rgba(76,175,80,0.1)',
              border: '1px solid rgba(76,175,80,0.2)',
              borderRadius: '24px', padding: '8px 24px',
              color: '#4CAF50', fontWeight: '700', fontSize: '14px',
            }}>
              Gerbang Terbuka
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TicketGenerator;
