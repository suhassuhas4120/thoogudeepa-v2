'use client';

export interface ActiveDiningSession {
  seatId: string;
  ticketNumber: string;
  orderId: string;
  orderStatus: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  customerName?: string;
  orderedAt: number;
  totalAmount: number;
}

const STORAGE_SESSION_KEY = 'thoogudeepa_v2_active_dining_session';

export function getActiveDiningSession(): ActiveDiningSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session: ActiveDiningSession = JSON.parse(raw);
    return session;
  } catch {
    return null;
  }
}

export function setActiveDiningSession(session: ActiveDiningSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to store active dining session:', err);
  }
}

export function updateActiveDiningSession(updates: Partial<ActiveDiningSession>): ActiveDiningSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const current = getActiveDiningSession();
    if (!current) return null;
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export function clearActiveDiningSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear dining session:', err);
  }
}

export function hasActiveUnpaidOrder(): boolean {
  const session = getActiveDiningSession();
  return Boolean(session && session.paymentStatus === 'unpaid');
}
