import React from 'react';

const StatusBadge = ({ status }) => {
  let bg = 'rgba(74, 96, 128, 0.1)';
  let border = '1px solid rgba(74, 96, 128, 0.2)';
  let color = '#8BA3BC';
  let label = status;

  if (status === 'active' || status === 'pending') {
    bg = 'rgba(0, 210, 255, 0.1)';
    border = '1px solid rgba(0, 210, 255, 0.3)';
    color = '#00D2FF';
    label = 'Aktif';
  } else if (status === 'claimed') {
    bg = 'rgba(76, 175, 80, 0.1)';
    border = '1px solid rgba(76, 175, 80, 0.3)';
    color = '#4CAF50';
    label = 'Sukses';
  } else if (status === 'cancelled') {
    bg = 'rgba(239, 83, 80, 0.1)';
    border = '1px solid rgba(239, 83, 80, 0.3)';
    color = '#EF5350';
    label = 'Dibatalkan';
  } else if (status === 'expired') {
    bg = 'rgba(255, 152, 0, 0.1)';
    border = '1px solid rgba(255, 152, 0, 0.3)';
    color = '#FF9800';
    label = 'Kedaluwarsa';
  }

  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      background: bg,
      border: border,
      color: color,
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {label}
    </span>
  );
};

export default StatusBadge;
