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
  orderItemId?: string;
  ticketNumber?: string;
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
  { id: 'w1', name: 'Ramesh Kumar', role: 'Zone 1 Lead', pinCode: '1234', assignedZone: 'Zone 1 (Seats 01-10)' },
  { id: 'w2', name: 'Suresh M', role: 'Zone 2 Floor', pinCode: '1234', assignedZone: 'Zone 2 (Seats 11-20)' },
  { id: 'w3', name: 'Anand Kumar', role: 'Zone 3 Floor', pinCode: '1234', assignedZone: 'Zone 3 (Seats 21-30)' },
  { id: 'w4', name: 'Deepa Naik', role: 'Zone 4 Floor', pinCode: '1234', assignedZone: 'Zone 4 (Seats 31-40)' }
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
  assignedZone: 'Zone 1 (Seats 01-10)',
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
 * Dynamically returns 10 seats for the selected waiter:
 * - Ramesh Kumar: Seats 01 - 10 (Zone 1)
 * - Suresh M: Seats 11 - 20 (Zone 2)
 * - Anand Kumar: Seats 21 - 30 (Zone 3)
 * - Deepa Naik: Seats 31 - 40 (Zone 4)
 */
export const getSeatsForWaiter = (waiterId: string): SeatItem[] => {
  switch (waiterId) {
    case 'w2': // Suresh M (Seats 11 to 20)
      return [
        { id: 's11', seatNumber: 'Seat 11', status: 'occupied', guestName: 'Manoj Gowda', guestCount: 2, diningTime: '15m', orderCount: 2, totalAmount: 380 },
        { id: 's12', seatNumber: 'Seat 12', status: 'vacant', guestName: 'Walk-In Guest', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's13', seatNumber: 'Seat 13', status: 'occupied', guestName: 'Pooja Hegde', guestCount: 3, diningTime: '22m', orderCount: 3, totalAmount: 590 },
        { id: 's14', seatNumber: 'Seat 14', status: 'occupied', guestName: 'Harish Kumar', guestCount: 4, diningTime: '41m', orderCount: 4, totalAmount: 960, hasBillRequest: true },
        { id: 's15', seatNumber: 'Seat 15', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's16', seatNumber: 'Seat 16', status: 'occupied', guestName: 'Vinay Prasad', guestCount: 2, diningTime: '28m', orderCount: 2, totalAmount: 450 },
        { id: 's17', seatNumber: 'Seat 17', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's18', seatNumber: 'Seat 18', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's19', seatNumber: 'Seat 19', status: 'occupied', guestName: 'Tejas K', guestCount: 1, diningTime: '10m', orderCount: 1, totalAmount: 260 },
        { id: 's20', seatNumber: 'Seat 20', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
      ];

    case 'w3': // Anand Kumar (Seats 21 to 30)
      return [
        { id: 's21', seatNumber: 'Seat 21', status: 'occupied', guestName: 'Girish Reddy', guestCount: 4, diningTime: '30m', orderCount: 4, totalAmount: 890 },
        { id: 's22', seatNumber: 'Seat 22', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's23', seatNumber: 'Seat 23', status: 'occupied', guestName: 'Sanjay Patel', guestCount: 2, diningTime: '19m', orderCount: 2, totalAmount: 420 },
        { id: 's24', seatNumber: 'Seat 24', status: 'occupied', guestName: 'Naveen Kumar', guestCount: 3, diningTime: '35m', orderCount: 3, totalAmount: 680, hasBillRequest: true },
        { id: 's25', seatNumber: 'Seat 25', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's26', seatNumber: 'Seat 26', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's27', seatNumber: 'Seat 27', status: 'occupied', guestName: 'Rohit Shenoy', guestCount: 2, diningTime: '25m', orderCount: 2, totalAmount: 510 },
        { id: 's28', seatNumber: 'Seat 28', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's29', seatNumber: 'Seat 29', status: 'occupied', guestName: 'Arun Murthy', guestCount: 3, diningTime: '14m', orderCount: 2, totalAmount: 390 },
        { id: 's30', seatNumber: 'Seat 30', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
      ];

    case 'w4': // Deepa Naik (Seats 31 to 40)
      return [
        { id: 's31', seatNumber: 'Seat 31', status: 'occupied', guestName: 'Chetan B', guestCount: 2, diningTime: '20m', orderCount: 2, totalAmount: 350 },
        { id: 's32', seatNumber: 'Seat 32', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's33', seatNumber: 'Seat 33', status: 'occupied', guestName: 'Sunil Joshi', guestCount: 4, diningTime: '45m', orderCount: 5, totalAmount: 1120, hasBillRequest: true },
        { id: 's34', seatNumber: 'Seat 34', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's35', seatNumber: 'Seat 35', status: 'occupied', guestName: 'Divya Shankar', guestCount: 2, diningTime: '16m', orderCount: 2, totalAmount: 440 },
        { id: 's36', seatNumber: 'Seat 36', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's37', seatNumber: 'Seat 37', status: 'occupied', guestName: 'Praveen Nayak', guestCount: 3, diningTime: '27m', orderCount: 3, totalAmount: 620 },
        { id: 's38', seatNumber: 'Seat 38', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's39', seatNumber: 'Seat 39', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's40', seatNumber: 'Seat 40', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
      ];

    case 'w1': // Ramesh Kumar (Seats 01 to 10)
    default:
      return [
        { id: 's01', seatNumber: 'Seat 01', status: 'occupied', guestName: 'Suhas M', guestCount: 2, diningTime: '24m', orderCount: 2, totalAmount: 320 },
        { id: 's02', seatNumber: 'Seat 02', status: 'vacant', guestName: 'Walk-In Guest', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's03', seatNumber: 'Seat 03', status: 'occupied', guestName: 'Rajesh V', guestCount: 3, diningTime: '18m', orderCount: 3, totalAmount: 480 },
        { id: 's04', seatNumber: 'Seat 04', status: 'occupied', guestName: 'Kiran R', guestCount: 4, diningTime: '38m', orderCount: 3, totalAmount: 840, hasBillRequest: true },
        { id: 's05', seatNumber: 'Seat 05', status: 'occupied', guestName: 'Darshan Gowda', guestCount: 2, diningTime: '32m', orderCount: 4, totalAmount: 740 },
        { id: 's06', seatNumber: 'Seat 06', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's07', seatNumber: 'Seat 07', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's08', seatNumber: 'Seat 08', status: 'occupied', guestName: 'Vikram Rao', guestCount: 2, diningTime: '12m', orderCount: 2, totalAmount: 410 },
        { id: 's09', seatNumber: 'Seat 09', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 },
        { id: 's10', seatNumber: 'Seat 10', status: 'vacant', guestName: 'Available', guestCount: 0, diningTime: 'Ready', orderCount: 0, totalAmount: 0 }
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
    imageUrl: '/images/dishes/chicken-donne-biryani.jpg',
    isVeg: false
  },
  {
    id: 2,
    name: 'Mutton Donne Biryani',
    category: 'biryani',
    price: 340,
    description: 'Slow-cooked tender military spiced mutton with flavored samba rice',
    imageUrl: '/images/dishes/mutton-donne-biryani.jpg',
    isVeg: false
  },
  {
    id: 3,
    name: 'Chilli Chicken (Dry)',
    category: 'starters',
    price: 220,
    description: 'Crispy chicken pieces tossed with green chillies, curry leaves and spices',
    imageUrl: '/images/dishes/chilli-chicken.jpg',
    isVeg: false
  },
  {
    id: 4,
    name: 'Military Chicken Kabab',
    category: 'starters',
    price: 210,
    description: 'Deep-fried spiced crispy bone chicken kabab (4 pieces)',
    imageUrl: '/images/dishes/chicken-kabab.jpg',
    isVeg: false
  },
  {
    id: 5,
    name: 'Gunpowder Ghee Rice',
    category: 'gravy',
    price: 180,
    description: 'Steamed aromatic rice tossed with pure desi ghee and roasted podi',
    imageUrl: '/images/dishes/biryani-rice.webp',
    isVeg: true
  },
  {
    id: 6,
    name: 'Fresh Lime Soda',
    category: 'drinks',
    price: 60,
    description: 'Chilled sparkling club soda with freshly squeezed lime',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80',
    isVeg: true
  },
  {
    id: 7,
    name: 'Donne Biryani Kushka',
    category: 'biryani',
    price: 160,
    description: 'Flavor-infused authentic seeraga samba biryani rice without meat pieces',
    imageUrl: '/images/dishes/donne-khushka.jpg',
    isVeg: true
  },
  {
    id: 8,
    name: 'Mutton Pepper Fry',
    category: 'starters',
    price: 320,
    description: 'Boneless tender mutton roasted with fresh ground black pepper & shallots',
    imageUrl: '/images/dishes/mutton-fry.jpg',
    isVeg: false
  }
];

export const INITIAL_TICKET_ITEMS: TicketItem[] = [
  {
    id: 1,
    name: 'Chicken Donne Biryani',
    quantity: 2,
    price: 520,
    imageUrl: '/images/dishes/chicken-donne-biryani.jpg',
    status: 'READY'
  },
  {
    id: 3,
    name: 'Chilli Chicken (Dry)',
    quantity: 1,
    price: 220,
    imageUrl: '/images/dishes/chilli-chicken.jpg',
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
    imageUrl: '/images/dishes/biryani-rice.webp',
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
