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
  deviceToken?: string;
  items?: { 
    id: string; 
    title: string; 
    quantity: number; 
    price: number; 
    notes?: string; 
    addons?: string[];
  }[];
}

const STORAGE_SESSION_KEY = 'thoogudeepa_v2_active_dining_session';
const STORAGE_DEVICE_TOKEN_KEY = 'thoogudeepa_v2_device_token';

/**
 * Returns a persistent unique identifier for this customer device/browser.
 * Used to verify ownership of an active dining session.
 */
export function getDeviceToken(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let token = localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY);
    if (!token) {
      token = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return 'dev_temp';
  }
}

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
    // Ensure session always has the current device token
    const token = session.deviceToken || getDeviceToken();
    const payload = { ...session, deviceToken: token };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(payload));
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

/**
 * Checks whether this device is currently locked to a different seat.
 * Example: Customer is seated at Seat 04, has placed an unpaid order, and scans Seat 05.
 */
export function isDeviceLockedToDifferentSeat(currentSeatId: string): {
  isLocked: boolean;
  activeSeatId?: string;
  ticketNumber?: string;
} {
  const session = getActiveDiningSession();
  if (
    session &&
    session.seatId !== currentSeatId &&
    session.paymentStatus === 'unpaid'
  ) {
    return {
      isLocked: true,
      activeSeatId: session.seatId,
      ticketNumber: session.ticketNumber,
    };
  }
  return { isLocked: false };
}
