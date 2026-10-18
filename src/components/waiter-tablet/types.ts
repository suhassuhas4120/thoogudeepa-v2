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

export interface ShiftActivity {
  id: string;
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
}

// Initial Mock Data Store
export const INITIAL_WAITER_PROFILE: WaiterProfile = {
  id: 'w1',
  name: 'Ramesh Kumar',
  role: 'Waiter 1',
  staffId: '#TH-104',
  assignedZone: 'Seats 01 – 10 (Zone 1)',
  clockInTime: '11:00 AM',
  shiftDuration: '3h 45m',
  metrics: {
    totalSales: 14850,
    billsSettled: 18,
    tipsEarned: 620,
    kotsPunched: 28,
    guestsServed: 42
  }
};

export const INITIAL_SEATS: SeatItem[] = [
  {
    id: 's01',
    seatNumber: 'Seat 01',
    status: 'occupied',
    guestName: 'Suhas M',
    guestCount: 2,
    diningTime: '24m',
    orderCount: 2,
    totalAmount: 320
  },
  {
    id: 's02',
    seatNumber: 'Seat 02',
    status: 'vacant',
    guestName: 'Walk-In Guest',
    guestCount: 0,
    diningTime: 'Ready',
    orderCount: 0,
    totalAmount: 0
  },
  {
    id: 's03',
    seatNumber: 'Seat 03',
    status: 'occupied',
    guestName: 'Rajesh V',
    guestCount: 3,
    diningTime: '18m',
    orderCount: 3,
    totalAmount: 480
  },
  {
    id: 's04',
    seatNumber: 'Seat 04',
    status: 'occupied',
    guestName: 'Kiran R',
    guestCount: 4,
    diningTime: '38m',
    orderCount: 3,
    totalAmount: 840,
    hasBillRequest: true
  },
  {
    id: 's05',
    seatNumber: 'Seat 05',
    status: 'occupied',
    guestName: 'Darshan Gowda',
    guestCount: 2,
    diningTime: '32m',
    orderCount: 4,
    totalAmount: 740
  },
  {
    id: 's06',
    seatNumber: 'Seat 06',
    status: 'vacant',
    guestName: 'Available',
    guestCount: 0,
    diningTime: 'Ready',
    orderCount: 0,
    totalAmount: 0
  },
  {
    id: 's07',
    seatNumber: 'Seat 07',
    status: 'vacant',
    guestName: 'Available',
    guestCount: 0,
    diningTime: 'Ready',
    orderCount: 0,
    totalAmount: 0
  },
  {
    id: 's08',
    seatNumber: 'Seat 08',
    status: 'vacant',
    guestName: 'Available',
    guestCount: 0,
    diningTime: 'Ready',
    orderCount: 0,
    totalAmount: 0
  },
  {
    id: 's09',
    seatNumber: 'Seat 09',
    status: 'vacant',
    guestName: 'Available',
    guestCount: 0,
    diningTime: 'Ready',
    orderCount: 0,
    totalAmount: 0
  },
  {
    id: 's10',
    seatNumber: 'Seat 10',
    status: 'vacant',
    guestName: 'Available',
    guestCount: 0,
    diningTime: 'Ready',
    orderCount: 0,
    totalAmount: 0
  }
];

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
