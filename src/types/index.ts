// Types cho hệ thống quản lý phòng trọ

export interface Address {
  houseNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface IDCardImages {
  front: string;
  back: string;
}

export interface BankTransferInfo {
  bank: string;
  transactionId: string;
}

export interface ServiceFee {
  name: string;
  amount: number;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  role: 'admin' | 'owner' | 'staff';
  avatar?: string;
  status: 'active' | 'locked';
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  _id?: string;
  name: string;
  address: Address;
  description?: string;
  images: string[];
  ownerId: string | User;
  totalRooms: number;
  commonAmenities: string[];
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    total: number;
    available: number;
    rented: number;
    booked: number;
    maintenance: number;
  };
}

export interface Room {
  _id?: string;
  roomCode: string;
  buildingId: string | Building;
  floor: number;
  area: number;
  rentPrice: number;
  deposit: number;
  description?: string;
  images: string[];
  amenities: string[];
  status: 'available' | 'booked' | 'rented' | 'maintenance';
  maxTenants: number;
  createdAt: Date;
  updatedAt: Date;
  currentContract?: {
    _id: string;
    tenantIds: Array<{
      _id: string;
      fullName: string;
      phoneNumber: string;
    }>;
    representativeId: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
}

export interface Tenant {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  idCardNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  hometown: string;
  idCardImages: IDCardImages;
  occupation?: string;
  password?: string;
  status: 'renting' | 'movedOut' | 'idle';
  createdAt: Date;
  updatedAt: Date;
  currentContract?: {
    _id: string;
    roomId: {
      _id: string;
      roomCode: string;
      buildingId: {
        _id: string;
        name: string;
      };
    };
  };
}

export interface Contract {
  _id?: string;
  contractCode: string;
  roomId: string | Room;
  tenantIds: string[] | Tenant[];
  representativeId: string | Tenant;
  startDate: Date;
  endDate: Date;
  rentPrice: number;
  deposit: number;
  paymentCycle: 'monthly' | 'quarterly' | 'yearly';
  paymentDay: number;
  terms: string;
  electricityPrice: number;
  waterPrice: number;
  electricityStart: number;
  waterStart: number;
  serviceFees: ServiceFee[];
  status: 'active' | 'expired' | 'cancelled';
  contractFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeterReading {
  _id?: string;
  roomId: string | Room;
  month: number;
  year: number;
  electricityPrev: number;
  electricityCurrent: number;
  electricityUsage: number;
  waterPrev: number;
  waterCurrent: number;
  waterUsage: number;
  electricityImage?: string;
  waterImage?: string;
  recordedBy: string | User;
  recordedAt: Date;
  createdAt: Date;
}

export interface Invoice {
  _id?: string;
  invoiceCode: string;
  contractId: string | Contract;
  roomId: string | Room;
  tenantId: string | Tenant;
  month: number;
  year: number;
  roomAmount: number;
  electricityAmount: number;
  electricityUsage: number;
  electricityStart: number;
  electricityEnd: number;
  waterAmount: number;
  waterUsage: number;
  waterStart: number;
  waterEnd: number;
  serviceFees: ServiceFee[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partiallyPaid' | 'paid' | 'overdue';
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id?: string;
  invoiceId: string | Invoice;
  amount: number;
  method: 'cash' | 'transfer' | 'eWallet';
  transferInfo?: BankTransferInfo;
  paymentDate: Date;
  receivedBy: string | User;
  notes?: string;
  receiptImage?: string;
  createdAt: Date;
}

export interface Issue {
  _id?: string;
  roomId: string | Room;
  tenantId: string | Tenant;
  title: string;
  description: string;
  images: string[];
  type: 'utility' | 'furniture' | 'cleanliness' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'processing' | 'resolved' | 'cancelled';
  handlerId?: string | User;
  handlerNotes?: string;
  reportedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: string;
  title: string;
  content: string;
  type: 'general' | 'invoice' | 'issue' | 'contract' | 'other';
  senderId: string | User;
  receiverIds: string[];
  roomIds?: string[];
  buildingId?: string | Building;
  readByIds: string[];
  sentAt: Date;
  createdAt: Date;
}

// Legacy aliases for backward compatibility (Standardized to English mapping)
export type DiaChi = Address;
export type AnhCCCD = IDCardImages;
export type ThongTinChuyenKhoan = BankTransferInfo;
export type PhiDichVu = ServiceFee;
export type NguoiDung = User;
export type ToaNha = Building;
export type Phong = Room;
export type KhachThue = Tenant;
export type HopDong = Contract;
export type ChiSoDienNuoc = MeterReading;
export type HoaDon = Invoice;
export type ThanhToan = Payment;
export type SuCo = Issue;
export type ThongBao = Notification;

// Types cho API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types cho form validation
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'admin' | 'owner' | 'staff';
}

// Dashboard stats (Standardized English)
export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  rentedRooms: number;
  maintenanceRooms: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  overdueInvoices: number;
  pendingIssues: number;
  expiringContracts: number;
}
