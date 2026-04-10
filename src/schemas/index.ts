import { z } from 'zod';

// Shared Sub-schemas
export const serviceFeeSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  amount: z.number().min(0, 'Amount must be at least 0'),
});

export const commonAmenityEnum = z.enum([
  'wifi', 'camera', 'security', 'parking', 'elevator', 'dryingArea', 'sharedBathroom', 'sharedKitchen'
]);

// Building Schema
export const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required'),
  address: z.object({
    houseNumber: z.string().min(1, 'House number is required'),
    street: z.string().min(1, 'Street is required'),
    ward: z.string().min(1, 'Ward/Commune is required'),
    district: z.string().min(1, 'District is required'),
    city: z.string().min(1, 'City is required'),
  }),
  description: z.string().optional(),
  commonAmenities: z.array(commonAmenityEnum).optional(),
});

// Room Schema
export const roomSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
  buildingId: z.string().min(1, 'Building is required'),
  floor: z.number().min(0, 'Floor must be at least 0'),
  area: z.number().min(1, 'Area must be greater than 0'),
  rentPrice: z.number().min(0, 'Rent price must be at least 0'),
  deposit: z.number().min(0, 'Deposit must be at least 0'),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  maxOccupants: z.number()
    .min(1, 'Max occupants must be at least 1')
    .max(10, 'Max occupants cannot exceed 10'),
});

// Tenant Schema
export const tenantSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  idCardNumber: z.string().regex(/^[0-9]{12}$/, 'ID card must be 12 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  hometown: z.string().min(1, 'Hometown is required'),
  idCardImages: z.object({
    front: z.string().optional(),
    back: z.string().optional(),
  }).optional(),
  occupation: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// Contract Schema
export const contractSchema = z.object({
  contractCode: z.string().min(1, 'Contract code is required'),
  roomId: z.string().min(1, 'Room is required'),
  tenantIds: z.array(z.string()).min(1, 'At least one tenant is required'),
  representativeId: z.string().min(1, 'Representative is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  rentPrice: z.number().min(0, 'Rent price must be at least 0'),
  deposit: z.number().min(0, 'Deposit must be at least 0'),
  paymentCycle: z.enum(['monthly', 'quarterly', 'yearly']),
  paymentDay: z.number().min(1).max(31, 'Day must be 1-31'),
  terms: z.string().min(1, 'Terms are required'),
  electricityPrice: z.number().min(0, 'Price must be at least 0'),
  waterPrice: z.number().min(0, 'Price must be at least 0'),
  electricityStart: z.number().min(0, 'Reading must be at least 0'),
  waterStart: z.number().min(0, 'Reading must be at least 0'),
  serviceFees: z.array(serviceFeeSchema).optional(),
  contractFile: z.string().optional(),
});

// Invoice Schema
export const invoiceSchema = z.object({
  id: z.string().optional(),
  invoiceCode: z.string().optional(),
  contractId: z.string().min(1, 'Contract is required'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  roomAmount: z.number().min(0),
  electricityStart: z.number().min(0),
  electricityEnd: z.number().min(0),
  waterStart: z.number().min(0),
  waterEnd: z.number().min(0),
  serviceFees: z.array(serviceFeeSchema).optional(),
  paidAmount: z.number().min(0).optional(),
  status: z.enum(['unpaid', 'partiallyPaid', 'paid', 'overdue']).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export type BuildingInput = z.infer<typeof buildingSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type TenantInput = z.infer<typeof tenantSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;

// Legacy compatibility exports (deprecated)
export { 
  buildingSchema as toaNhaSchema,
  roomSchema as phongSchema,
  tenantSchema as khachThueSchema,
  contractSchema as hopDongSchema,
  invoiceSchema as hoaDonSchema,
};
export type ToaNhaInput = BuildingInput;
export type PhongInput = RoomInput;
export type KhachThueInput = TenantInput;
export type HopDongInput = ContractInput;
export type HoaDonInput = InvoiceInput;
