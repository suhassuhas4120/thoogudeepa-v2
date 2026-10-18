// Thoogudeepa Waiter Tablet POS - Types & Data Models
// Comprehensive type definitions and mock state data

export type ScreenId = 'login' | 'seats' | 'order' | 'profile';
export type SeatStatus = 'occupied' | 'vacant';
export type KitchenStatus = 'PLACED' | 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
export type PaymentMode = 'cash' | 'upi';
export type AlertType = 'customer' | 'kitchen';

export interface WaiterProfile {
  id: string;
  name: string;
  role: string;
  staffId: string;
  assignedZone: string;
  clockInTime: string;
  shiftDuration: string;
  avatarInitials?: string;
  shiftStartTime?: string;
  metrics: {
    totalSales: number;
    billsSettled: number;
    tipsEarned: number;
    kotsPunched: number;
    guestsServed: number;
  };
}

export interface SeatItem {
  id: string;
  seatNumber: string;
  status: SeatStatus;
  guestName: string;
  guestCount: number;
  diningTime: string;
  orderCount: number;
  totalAmount: number;
  hasBillRequest?: boolean;
}

export interface DishItem {
  id: number;
  name: string;
  category: 'biryani' | 'starters' | 'gravy' | 'drinks';
  price: number;
  description: string;
  imageUrl: string;
  isVeg: boolean;
}

export interface TicketItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
  status: KitchenStatus;
}

export interface ServiceAlert {
  id: string;
  type: AlertType;
  seatNumber: string;
  guestName: string;
  title: string;
  description: string;
  timeAgo: string;
  amount?: number;
  kotId?: string;
  isResolved: boolean;
}

export interface WaiterOption {
  id: string;
  name: string;
  role: string;
  pinCode: string;
  assignedZone?: string;
}

export const DEFAULT_WAITERS: WaiterOption[] = [
  { id: 'w1', name: 'Ramesh Kumar', role: 'Zone 1 Lead', pinCode: '1234', assignedZone: 'Zone 1 (Tables 01-10)' },
  { id: 'w2', name: 'Suresh M', role: 'Zone 2 Floor', pinCode: '1234', assignedZone: 'Zone 2 (Tables 11-20)' },
  { id: 'w3', name: 'Anand Kumar', role: 'Zone 3 Floor', pinCode: '1234', assignedZone: 'Zone 3 (Tables 21-30)' },
  { id: 'w4', name: 'Deepa Naik', role: 'Zone 4 Floor', pinCode: '1234', assignedZone: 'Zone 4 (Tables 31-40)' }
];

export interface ShiftActivity {
  id: string;
  title?: string;
  description?: string;
  action?: string;
  amount?: string;
  time?: string;
  timestamp?: string;
}

// Initial Mock Data Store
export const INITIAL_WAITER_PROFILE: WaiterProfile = {
  id: 'w1',
  name: 'Ramesh Kumar',
  role: 'Zone 1 Lead',
  staffId: '#TH-104',
  assignedZone: 'Zone 1 (Tables 01-10)',
  clockInTime: '11:00 AM',
  shiftDuration: '3h 45m',
  avatarInitials: 'RK',
  shiftStartTime: '11:00 AM',
  metrics: {
    totalSales: 14850,
    billsSettled: 18,
    tipsEarned: 620,
    kotsPunched: 28,
    guestsServed: 42
  }
};

/**
 * Dynamically returns 10 tables for the selected waiter:
 * - Ramesh Kumar: Tables 01 - 10 (Zone 1)
 * - Suresh M: Tables 11 - 20 (Zone 2)
 * - Anand Kumar: Tables 21 - 30 (Zone 3)
 * - Deepa Naik: Tables 31 - 40 (Zone 4)
 */
export const getSeatsForWaiter = (waiterId: string): SeatItem[] => {
  switch (waiterId) {
    case 'w2': // Suresh M (Tables 11 to 20)
      return [
        { id: 't11', seatNumber: 'Table 11', status: 'occupied', guestName: 'Manoj Gowda', guestCount: 2, diningTime: '15m', orderCount: 2, totalAmount: 380 },
        { id: 't12', seatNumber: 'Table 12', status: 'vacant', guestName: 'Walk-In Guest', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't13', seatNumber: 'Table 13', status: 'occupied', guestName: 'Pooja Hegde', guestCount: 3, diningTime: '22m', orderCount: 3, totalAmount: 590 },
        { id: 't14', seatNumber: 'Table 14', status: 'occupied', guestName: 'Harish Kumar', guestCount: 4, diningTime: '41m', orderCount: 4, totalAmount: 960, hasBillRequest: true },
        { id: 't15', seatNumber: 'Table 15', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't16', seatNumber: 'Table 16', status: 'occupied', guestName: 'Vinay Prasad', guestCount: 2, diningTime: '28m', orderCount: 2, totalAmount: 450 },
        { id: 't17', seatNumber: 'Table 17', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't18', seatNumber: 'Table 18', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't19', seatNumber: 'Table 19', status: 'occupied', guestName: 'Tejas K', guestCount: 1, diningTime: '10m', orderCount: 1, totalAmount: 260 },
        { id: 't20', seatNumber: 'Table 20', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
      ];

    case 'w3': // Anand Kumar (Tables 21 to 30)
      return [
        { id: 't21', seatNumber: 'Table 21', status: 'occupied', guestName: 'Girish Reddy', guestCount: 4, diningTime: '30m', orderCount: 4, totalAmount: 890 },
        { id: 't22', seatNumber: 'Table 22', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't23', seatNumber: 'Table 23', status: 'occupied', guestName: 'Sanjay Patel', guestCount: 2, diningTime: '19m', orderCount: 2, totalAmount: 420 },
        { id: 't24', seatNumber: 'Table 24', status: 'occupied', guestName: 'Naveen Kumar', guestCount: 3, diningTime: '35m', orderCount: 3, totalAmount: 680, hasBillRequest: true },
        { id: 't25', seatNumber: 'Table 25', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't26', seatNumber: 'Table 26', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't27', seatNumber: 'Table 27', status: 'occupied', guestName: 'Rohit Shenoy', guestCount: 2, diningTime: '25m', orderCount: 2, totalAmount: 510 },
        { id: 't28', seatNumber: 'Table 28', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't29', seatNumber: 'Table 29', status: 'occupied', guestName: 'Arun Murthy', guestCount: 3, diningTime: '14m', orderCount: 2, totalAmount: 390 },
        { id: 't30', seatNumber: 'Table 30', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
      ];

    case 'w4': // Deepa Naik (Tables 31 to 40)
      return [
        { id: 't31', seatNumber: 'Table 31', status: 'occupied', guestName: 'Chetan B', guestCount: 2, diningTime: '20m', orderCount: 2, totalAmount: 350 },
        { id: 't32', seatNumber: 'Table 32', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't33', seatNumber: 'Table 33', status: 'occupied', guestName: 'Sunil Joshi', guestCount: 4, diningTime: '45m', orderCount: 5, totalAmount: 1120, hasBillRequest: true },
        { id: 't34', seatNumber: 'Table 34', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't35', seatNumber: 'Table 35', status: 'occupied', guestName: 'Divya Shankar', guestCount: 2, diningTime: '16m', orderCount: 2, totalAmount: 440 },
        { id: 't36', seatNumber: 'Table 36', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't37', seatNumber: 'Table 37', status: 'occupied', guestName: 'Praveen Nayak', guestCount: 3, diningTime: '27m', orderCount: 3, totalAmount: 620 },
        { id: 't38', seatNumber: 'Table 38', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't39', seatNumber: 'Table 39', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't40', seatNumber: 'Table 40', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
      ];

    case 'w1': // Ramesh Kumar (Tables 01 to 10)
    default:
      return [
        { id: 't01', seatNumber: 'Table 01', status: 'occupied', guestName: 'Suhas M', guestCount: 2, diningTime: '24m', orderCount: 2, totalAmount: 320 },
        { id: 't02', seatNumber: 'Table 02', status: 'vacant', guestName: 'Walk-In Guest', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't03', seatNumber: 'Table 03', status: 'occupied', guestName: 'Rajesh V', guestCount: 3, diningTime: '18m', orderCount: 3, totalAmount: 480 },
        { id: 't04', seatNumber: 'Table 04', status: 'occupied', guestName: 'Kiran R', guestCount: 4, diningTime: '38m', orderCount: 3, totalAmount: 840, hasBillRequest: true },
        { id: 't05', seatNumber: 'Table 05', status: 'occupied', guestName: 'Darshan Gowda', guestCount: 2, diningTime: '32m', orderCount: 4, totalAmount: 740 },
        { id: 't06', seatNumber: 'Table 06', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't07', seatNumber: 'Table 07', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't08', seatNumber: 'Table 08', status: 'occupied', guestName: 'Vikram Rao', guestCount: 2, diningTime: '12m', orderCount: 2, totalAmount: 410 },
        { id: 't09', seatNumber: 'Table 09', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 't10', seatNumber: 'Table 10', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
      ];
  }
};

export const INITIAL_SEATS: SeatItem[] = getSeatsForWaiter('w1');

export const MENU_DISHES: DishItem[] = [
  {
    id: 1,
    name: 'Chicken Donne Biryani',
    category: 'biryani',
    price: 260,
    description: 'Traditional seeraga samba rice cooked with military spiced chicken',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=150&q=80',
    isVeg: false
  },
  {
    id: 2,
    name: 'Mutton Donne Biryani',
    category: 'biryani',
    price: 340,
    description: 'Slow-cooked tender military spiced mutton with flavored samba rice',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=150&q=80',
    isVeg: false
  },
  {
    id: 3,
    name: 'Chilli Chicken (Dry)',
    category: 'starters',
    price: 220,
    description: 'Crispy chicken pieces tossed with green chillies, curry leaves and spices',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=150&q=80',
    isVeg: false
  },
  {
    id: 4,
    name: 'Military Chicken Kabab',
    category: 'starters',
    price: 210,
    description: 'Deep-fried spiced crispy bone chicken kabab (4 pieces)',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=150&q=80',
    isVeg: false
  },
  {
    id: 5,
    name: 'Gunpowder Ghee Rice',
    category: 'gravy',
    price: 180,
    description: 'Steamed aromatic rice tossed with pure desi ghee and roasted podi',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=150&q=80',
    isVeg: true
  },
  {
    id: 6,
    name: 'Fresh Lime Soda',
    category: 'drinks',
    price: 60,
    description: 'Chilled sparkling club soda with freshly squeezed lime',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=150&q=80',
    isVeg: true
  },
  {
    id: 7,
    name: 'Donne Biryani Kushka',
    category: 'biryani',
    price: 160,
    description: 'Flavor-infused authentic seeraga samba biryani rice without meat pieces',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=150&q=80',
    isVeg: true
  },
  {
    id: 8,
    name: 'Mutton Pepper Fry',
    category: 'starters',
    price: 320,
    description: 'Boneless tender mutton roasted with fresh ground black pepper & shallots',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80',
    isVeg: false
  }
];

export const INITIAL_TICKET_ITEMS: TicketItem[] = [
  {
    id: 1,
    name: 'Chicken Donne Biryani',
    quantity: 2,
    price: 520,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=120&q=80',
    status: 'READY'
  },
  {
    id: 3,
    name: 'Chilli Chicken (Dry)',
    quantity: 1,
    price: 220,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=120&q=80',
    status: 'PREPARING'
  },
  {
    id: 6,
    name: 'Fresh Lime Soda',
    quantity: 1,
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=120&q=80',
    status: 'RECEIVED'
  },
  {
    id: 5,
    name: 'Gunpowder Ghee Rice',
    quantity: 1,
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=120&q=80',
    status: 'PLACED'
  }
];

export const INITIAL_ALERTS: ServiceAlert[] = [
  {
    id: 'alert-01',
    type: 'customer',
    seatNumber: 'Seat 03',
    guestName: 'Rajesh V',
    title: 'Water Refill Requested',
    description: 'Guest clicked "Bring Water" on phone menu',
    timeAgo: '2 mins ago',
    isResolved: false
  },
  {
    id: 'alert-02',
    type: 'customer',
    seatNumber: 'Seat 04',
    guestName: 'Kiran R',
    title: 'Bill Requested',
    description: 'Guest is ready to checkout & settle',
    timeAgo: '1 min ago',
    amount: 840,
    isResolved: false
  },
  {
    id: 'alert-03',
    type: 'kitchen',
    seatNumber: 'Seat 01',
    guestName: 'Suhas M',
    title: '2x Chicken Donne Biryani',
    description: 'Pass Counter 1 (Chef Anand)',
    timeAgo: '3 mins ago',
    kotId: 'KOT #108',
    isResolved: false
  },
  {
    id: 'alert-04',
    type: 'kitchen',
    seatNumber: 'Seat 05',
    guestName: 'Darshan Gowda',
    title: '1x Chilli Chicken + 1x Ghee Rice',
    description: 'Tandoor & Starters Section',
    timeAgo: 'Just now',
    kotId: 'KOT #109',
    isResolved: false
  }
];

export const SHIFT_LOGS: ShiftActivity[] = [
  {
    id: 'log-1',
    title: 'Settled Seat 07 Bill',
    description: 'Mutton Biryani + Soda • UPI Payment Verified',
    amount: '+₹400',
    timestamp: '12:49 PM'
  },
  {
    id: 'log-2',
    title: 'Punched KOT #107 for Seat 05',
    description: '4 Items sent to kitchen counter',
    timestamp: '12:44 PM'
  },
  {
    id: 'log-3',
    title: 'Customer Water Call Resolved',
    description: 'Attended Seat 03 (Water Pitcher provided)',
    timestamp: '12:38 PM'
  }
];
