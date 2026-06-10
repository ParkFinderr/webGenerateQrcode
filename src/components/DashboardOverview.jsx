import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  History,
  FileText,
  CarFront,
  TrendingUp,
  PlusCircle,
  List
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const DashboardOverview = ({
  ticketsList,
  onNavigate,
  getTodayTicketsCount,
  getActiveTicketsCount,
  getClaimedTicketsCount
}) => {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: 0 }}>
          Ringkasan Gate Control
        </h1>
        <p style={{ color: '#8BA3BC', fontSize: '14px', marginTop: '4px' }}>
          Pantau pembuatan dan pemindaian tiket parkir secara real-time.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-glow" style={{ background: '#00D2FF' }} />
          <div>
            <p style={{ color: '#8BA3BC', fontSize: '13px', fontWeight: '600', margin: 0 }}>
              Tiket Dibuat Hari Ini
            </p>
            <h3 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '8px 0 0 0' }}>
              {getTodayTicketsCount()}
            </h3>
          </div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(0, 210, 255, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar style={{ color: '#00D2FF', width: '22px', height: '22px' }} />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-glow" style={{ background: '#FF9800' }} />
          <div>
            <p style={{ color: '#8BA3BC', fontSize: '13px', fontWeight: '600', margin: 0 }}>
              Tiket Aktif (Belum Scan)
            </p>
            <h3 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '8px 0 0 0' }}>
              {getActiveTicketsCount()}
            </h3>
          </div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(255, 152, 0, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock style={{ color: '#FF9800', width: '22px', height: '22px' }} />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-glow" style={{ background: '#4CAF50' }} />
          <div>
            <p style={{ color: '#8BA3BC', fontSize: '13px', fontWeight: '600', margin: 0 }}>
              Tiket Sukses (Claimed)
            </p>
            <h3 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '8px 0 0 0' }}>
              {getClaimedTicketsCount()}
            </h3>
          </div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(76, 175, 80, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle style={{ color: '#4CAF50', width: '22px', height: '22px' }} />
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History style={{ width: '18px', height: '18px', color: '#00D2FF' }} />
            Aktivitas Tiket Terbaru
          </h3>
          {ticketsList.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#4A6080' }}>
              <FileText style={{ width: '40px', height: '40px', margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Belum ada aktivitas tiket di area ini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ticketsList.slice(0, 5).map(ticket => {
                const date = ticket.createdAt?.seconds 
                  ? new Date(ticket.createdAt.seconds * 1000) 
                  : new Date();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={ticket.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: '#1A2D47', border: '1px solid rgba(30, 58, 95, 0.5)',
                    borderRadius: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'rgba(0, 210, 255, 0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CarFront style={{ color: '#00D2FF', width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <p style={{ color: '#fff', fontWeight: '700', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {ticket.qrCode || ticket.id}
                        </p>
                        <span style={{ color: '#8BA3BC', fontSize: '11px' }}>
                          {ticket.plateNumber ? `${ticket.plateNumber} • ` : ''}{timeStr}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp style={{ width: '18px', height: '18px', color: '#00D2FF' }} />
              Kontrol Gerbang
            </h3>
            <p style={{ color: '#8BA3BC', fontSize: '14px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              Gunakan tombol di bawah untuk membuka form pembuatan tiket baru atau memantau daftar tiket yang aktif di database gerbang ini.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => onNavigate('generate')}
              style={{
                padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #00D2FF, #0066AA)',
                color: '#fff', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 210, 255, 0.25)',
              }}
            >
              <PlusCircle style={{ width: '16px', height: '16px' }} />
              Buat Tiket Baru
            </button>
            <button
              onClick={() => onNavigate('active-list')}
              style={{
                padding: '14px', borderRadius: '12px', background: '#1A2D47',
                color: '#00D2FF', fontWeight: '700', fontSize: '14px', border: '1px solid #1E3A5F', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <List style={{ width: '16px', height: '16px' }} />
              Lihat Daftar Tiket Aktif
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
