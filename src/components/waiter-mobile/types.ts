/**
 * Thoogudeepa Donne Biryani - Waiter Mobile POS Cockpit
 * Comprehensive TypeScript Domain Models, Interfaces, and Constants
 *
 * Designed specifically for the high-velocity mobile waiter interface:
 * - Seat-Centric Floor Management (Zone 1: Seats 01 to 10)
 * - Color-Coded Seat Status Tokens (Vacant Emerald, Occupied Amber, Bill Req Rose)
 * - Category-Filtered Donne Biryani Food Catalog
 * - Real-Time KOT Ticket Management & Cart State
 * - Floor Service Alerts (Customer Calls & Kitchen Pass Ready)
 * - Multi-Mode Bill Settlement & Split-Payment Calculation
 * - Waiter Shift Metrics & Performance Telemetry
 *
 * Architecture Compliance:
 * - Strict File Size: Maintained strictly between 300 and 400 lines
 * - Zero Bloat: Native TypeScript definitions without external dependencies
 */

export type SeatOccupancyStatus = 'vacant' | 'occupied' | 'billing';
export type SeatFilterTab = 'all' | 'occupied' | 'vacant';
export type MobileScreenId = 'login' | 'seats' | 'order' | 'cart' | 'alerts' | 'profile' | 'bill';
export type LiveOrderDishMode = 'placed' | 'received' | 'preparing' | 'ready' | 'served';
export type AlertSubTab = 'calls' | 'kitchen';
export type FoodDietaryType = 'non_veg' | 'veg';
export type MenuCategoryKey = 'all' | 'biryani' | 'starters' | 'gravy' | 'drinks';
export type PaymentMethod = 'cash' | 'upi' | 'card';
export type ShiftStatus = 'clocked_in' | 'on_break' | 'shift_ended';

/**
 * Individual seat entity on the restaurant floor
 */
export interface SeatEntity {
  readonly id: string;
  readonly seatNumber: string;
  readonly numericId: number;
  readonly status: SeatOccupancyStatus;
  readonly guestName?: string;
  readonly guestCount?: number;
  readonly itemCount?: number;
  readonly runningTotal?: number;
  readonly diningDuration?: string;
  readonly zone: string;
  readonly hasPendingAlert?: boolean;
  readonly alertMessage?: string;
}

/**
 * Food catalog menu item specification
 */
export interface MenuItem {
  readonly id: string;
  readonly name: string;
  readonly kannadaName?: string;
  readonly price: number;
  readonly category: MenuCategoryKey;
  readonly dietary: FoodDietaryType;
  readonly description: string;
  readonly prepTimeMinutes: number;
  readonly isAvailable: boolean;
  readonly isBestseller?: boolean;
}

/**
 * Cart line item selected by the waiter
 */
export interface CartItem {
  readonly menuItem: MenuItem;
  quantity: number;
  lineTotal: number;
  kitchenNote?: string;
  stage?: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED';
}

/**
 * Live order ticket punched to kitchen (KOT)
 */
export interface OrderTicket {
  readonly kotNumber: string;
  readonly seatNumber: string;
  readonly guestName: string;
  readonly waiterName: string;
  readonly items: CartItem[];
  readonly subtotal: number;
  readonly gstAmount: number;
  readonly grandTotal: number;
  readonly punchedAt: string;
  readonly status: 'pending' | 'cooking' | 'ready' | 'served';
  readonly specialInstructions?: string;
}

/**
 * Real-time floor service notification
 */
export interface FloorAlert {
  readonly id: string;
  readonly type: 'customer_call' | 'kitchen_ready';
  readonly seatNumber: string;
  readonly guestName?: string;
  readonly title: string;
  readonly message: string;
  readonly timeAgo: string;
  readonly billAmount?: number;
  readonly kotNumber?: string;
  readonly isUrgent: boolean;
}

/**
 * Active waiter profile and session statistics
 */
export interface WaiterProfile {
  readonly staffId: string;
  readonly name: string;
  readonly initials: string;
  readonly assignedSection: string;
  readonly assignedSeats: string;
  readonly clockInTime: string;
  readonly activeDuration: string;
  readonly totalSales: number;
  readonly billsSettledCount: number;
  readonly tipsEarned: number;
  readonly kotsPunched: number;
  readonly guestsServed: number;
  readonly connectionStatus: 'online_5g' | 'offline';
}

/**
 * Waiter authentication credentials and assignment
 */
export interface WaiterAuthAccount {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly seatRange: string;
  readonly passcode: string;
  readonly zone: string;
}

/**
 * Item in the shift activity audit log
 */
export interface ShiftActivityLog {
  readonly id: string;
  readonly title: string;
  readonly amountFormatted?: string;
  readonly timestamp: string;
  readonly badgeType: 'sale' | 'kot' | 'alert';
}

/**
 * Bill receipt checkout summary
 */
export interface BillReceipt {
  readonly invoiceNumber: string;
  readonly seatNumber: string;
  readonly guestName: string;
  readonly waiterName: string;
  readonly items: {
    readonly name: string;
    readonly quantity: number;
    readonly unitPrice: number;
    readonly total: number;
  }[];
  readonly subtotal: number;
  readonly cgst: number;
  readonly sgst: number;
  readonly grandTotal: number;
  readonly paymentMethod: PaymentMethod;
  readonly settledAt: string;
}

/**
 * Standard default restaurant configuration constants
 */
export const RESTAURANT_CONSTANTS = {
  BRAND_NAME: 'Thoogudeepa Donne Biryani',
  KANNADA_NAME: 'ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ',
  SUBTITLE: 'Military Hotel • Waiter Mobile POS',
  DEFAULT_ZONE: 'Zone 1 (Seats 01 – 10)',
  DEFAULT_WAITER_ID: '#TH-104',
  DEFAULT_WAITER_NAME: 'Ramesh Kumar',
  TAX_RATE_CGST: 0.025,
  TAX_RATE_SGST: 0.025,
  TOTAL_ZONE_SEATS: 10,
} as const;

/**
 * Pre-configured active staff list for login selection
 */
export const DEFAULT_STAFF_ACCOUNTS: WaiterAuthAccount[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    initials: 'RK',
    seatRange: 'Seats 01 to 10',
    passcode: '1234',
    zone: 'Zone 1'
  },
  {
    id: '2',
    name: 'Suresh M',
    initials: 'SM',
    seatRange: 'Seats 11 to 20',
    passcode: '2345',
    zone: 'Zone 2'
  },
  {
    id: '3',
    name: 'Anand K',
    initials: 'AK',
    seatRange: 'Seats 21 to 30',
    passcode: '3456',
    zone: 'Zone 3'
  },
  {
    id: '4',
    name: 'Dinesh N',
    initials: 'DN',
    seatRange: 'Seats 31 to 40',
    passcode: '4567',
    zone: 'Zone 4'
  }
];

/**
 * Initial Zone 1 seat matrix (10 Seats: 4 Occupied, 6 Vacant)
 */
export const INITIAL_SEAT_DATA: SeatEntity[] = [
  {
    id: 'seat-01',
    seatNumber: 'Seat 01',
    numericId: 1,
    status: 'occupied',
    guestName: 'Suhas M',
    guestCount: 2,
    itemCount: 2,
    runningTotal: 320,
    diningDuration: '14m',
    zone: 'Zone 1'
  },
  {
    id: 'seat-02',
    seatNumber: 'Seat 02',
    numericId: 2,
    status: 'vacant',
    zone: 'Zone 1'
  },
  {
    id: 'seat-03',
    seatNumber: 'Seat 03',
    numericId: 3,
    status: 'occupied',
    guestName: 'Rajesh V',
    guestCount: 1,
    itemCount: 3,
    runningTotal: 480,
    diningDuration: '22m',
    zone: 'Zone 1',
    hasPendingAlert: true,
    alertMessage: 'Water Refill Requested'
  },
  {
    id: 'seat-04',
    seatNumber: 'Seat 04',
    numericId: 4,
    status: 'billing',
    guestName: 'Kiran R',
    guestCount: 2,
    itemCount: 3,
    runningTotal: 840,
    diningDuration: '38m',
    zone: 'Zone 1',
    hasPendingAlert: true,
    alertMessage: 'Bill Requested (₹840)'
  },
  {
    id: 'seat-05',
    seatNumber: 'Seat 05',
    numericId: 5,
    status: 'occupied',
    guestName: 'Anil Kumar',
    guestCount: 2,
    itemCount: 2,
    runningTotal: 420,
    diningDuration: '8m',
    zone: 'Zone 1'
  },
  {
    id: 'seat-06',
    seatNumber: 'Seat 06',
    numericId: 6,
    status: 'vacant',
    zone: 'Zone 1'
  },
  {
    id: 'seat-07',
    seatNumber: 'Seat 07',
    numericId: 7,
    status: 'vacant',
    zone: 'Zone 1'
  },
  {
    id: 'seat-08',
    seatNumber: 'Seat 08',
    numericId: 8,
    status: 'vacant',
    zone: 'Zone 1'
  },
  {
    id: 'seat-09',
    seatNumber: 'Seat 09',
    numericId: 9,
    status: 'vacant',
    zone: 'Zone 1'
  },
  {
    id: 'seat-10',
    seatNumber: 'Seat 10',
    numericId: 10,
    status: 'vacant',
    zone: 'Zone 1'
  }
];

/**
 * Pre-populated food catalog for Thoogudeepa Donne Biryani
 */
export const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-01',
    name: 'Chicken Donne Biryani',
    kannadaName: 'ಚಿಕನ್ ದೊನ್ನೆ ಬಿರಿಯಾನಿ',
    price: 260,
    category: 'biryani',
    dietary: 'non_veg',
    description: 'Cooked with seeraga samba rice, tender country chicken & fragrant herbs.',
    prepTimeMinutes: 8,
    isAvailable: true,
    isBestseller: true
  },
  {
    id: 'menu-02',
    name: 'Mutton Donne Biryani',
    kannadaName: 'ಮಟನ್ ದೊನ್ನೆ ಬಿರಿಯಾನಿ',
    price: 340,
    category: 'biryani',
    dietary: 'non_veg',
    description: 'Tender local mutton slow-steamed in traditional leaf donne pot.',
    prepTimeMinutes: 10,
    isAvailable: true,
    isBestseller: true
  },
  {
    id: 'menu-03',
    name: 'Chilli Chicken Dry',
    kannadaName: 'ಚಿಲ್ಲಿ ಚಿಕನ್ ಡ್ರೈ',
    price: 220,
    category: 'starters',
    dietary: 'non_veg',
    description: 'Signature military-style spicy green chilli tossed crisp chicken.',
    prepTimeMinutes: 6,
    isAvailable: true
  },
  {
    id: 'menu-04',
    name: 'Gunpowder Ghee Rice',
    kannadaName: 'ತುಪ್ಪದ ಅನ್ನ ಗನ್‌ಪೌಡರ್',
    price: 180,
    category: 'gravy',
    dietary: 'veg',
    description: 'Fragrant steamed ghee rice dusted with aromatic podi gunpowder.',
    prepTimeMinutes: 5,
    isAvailable: true
  },
  {
    id: 'menu-05',
    name: 'Masala Buttermilk Chaas',
    kannadaName: 'ಮಸಾಲೆ ಮಜ್ಜಿಗೆ',
    price: 60,
    category: 'drinks',
    dietary: 'veg',
    description: 'Chilled spiced curd with fresh ginger, coriander & roasted cumin.',
    prepTimeMinutes: 2,
    isAvailable: true
  }
];
