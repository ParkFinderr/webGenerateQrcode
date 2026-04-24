import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useTicketListener = (ticketId) => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [prevTicketId, setPrevTicketId] = useState(ticketId);

  if (ticketId !== prevTicketId) {
    setPrevTicketId(ticketId);
    setStatus(null);
    setError(null);
  }

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    const ticketRef = doc(db, 'tickets', ticketId);

    const unsubscribe = onSnapshot(
      ticketRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setStatus(docSnap.data().status);
        } else {
          setError('Ticket not found in database');
        }
      },
      (err) => {
        console.error('Error listening to ticket:', err);
        setError(err.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [ticketId]);

  return { status, error };
};
