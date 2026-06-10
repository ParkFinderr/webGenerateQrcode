import React from 'react';
import {
  PlusCircle,
  QrCode,
  Copy,
  Trash2
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const ActiveTicketsList = ({
  ticketsList,
  loadingTickets,
  onNavigate,
  onCopyCode,
  onCancelTicket
}) => {
  const activeTickets = ticketsList.filter(t => t.status === 'active' || t.status === 'pending');

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0 }}>
            Daftar Tiket Aktif
          </h2>
          <p style={{ color: '#8BA3BC', fontSize: '13px', marginTop: '4px' }}>
            Menampilkan tiket yang belum dipindai oleh pengunjung di gerbang parkir.
          </p>
        </div>
        <button
          onClick={() => { onNavigate('generate'); }}
          style={{
            padding: '10px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #00D2FF, #0066AA)',
            color: '#fff', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <PlusCircle style={{ width: '14px', height: '14px' }} />
          Buat Tiket
        </button>
      </div>

      {loadingTickets ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid #1E3A5F',
            borderTopColor: '#00D2FF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px',
          }} />
          <p style={{ color: '#8BA3BC', fontSize: '14px' }}>Memuat daftar tiket...</p>
        </div>
      ) : activeTickets.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#4A6080' }}>
          <QrCode style={{ width: '56px', height: '56px', margin: '0 auto 16px auto', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Tidak Ada Tiket Aktif</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Semua tiket telah dipindai atau dibatalkan.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
             <thead>
              <tr>
                <th>Kode Tiket</th>
                <th>Waktu Dibuat</th>
                <th>Pelat / Pengunjung</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeTickets.map(ticket => {
                const date = ticket.createdAt?.seconds 
                  ? new Date(ticket.createdAt.seconds * 1000) 
                  : new Date();
                const dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <tr key={ticket.id}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace', color: '#00D2FF' }}>
                      {ticket.qrCode || ticket.id}
                    </td>
                    <td>{dateStr}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{ticket.plateNumber || '-'}</div>
                      <div style={{ fontSize: '11px', color: '#8BA3BC' }}>{ticket.visitorName || ''}</div>
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button
                          onClick={() => onCopyCode(ticket.qrCode || ticket.id)}
                          title="Salin Kode"
                          style={{
                            background: 'rgba(0, 210, 255, 0.1)',
                            border: '1px solid rgba(0, 210, 255, 0.2)',
                            borderRadius: '6px', padding: '6px',
                            color: '#00D2FF', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 210, 255, 0.2)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 210, 255, 0.1)'}
                        >
                          <Copy style={{ width: '14px', height: '14px' }} />
                        </button>
                        <button
                          onClick={() => onCancelTicket(ticket.id)}
                          title="Batalkan Tiket"
                          style={{
                            background: 'rgba(239, 83, 80, 0.1)',
                            border: '1px solid rgba(239, 83, 80, 0.2)',
                            borderRadius: '6px', padding: '6px',
                            color: '#EF5350', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 83, 80, 0.2)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 83, 80, 0.1)'}
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveTicketsList;
