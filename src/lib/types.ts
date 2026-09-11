export type Role = "farmer" | "admin";
export type Lang = "en" | "hi" | "gu";
export type Congestion = "low" | "medium" | "high";
export type CenterStatus = "Open" | "Busy" | "Closed";
export type FarmerStatus = "Active" | "Pending" | "Inactive";
export type BookingStatus = "Confirmed" | "Completed" | "Cancelled" | "Rescheduled";
export type SlotState = "AVAILABLE" | "LIMITED" | "FULL" | "CLOSED";
export type ProcurementStatus =
  | "Received"
  | "Graded"
  | "Approved"
  | "Payment Pending"
  | "Paid";
export type PaymentStatus = "Paid" | "Processing" | "Delayed";
export type GrievanceStatus = "Open" | "In Progress" | "Resolved" | "Escalated";
export type GrievanceCategory =
  | "Payment Delay"
  | "Incorrect Grading"
  | "Slot Problem"
  | "Center Problem"
  | "Other";
export type Crop = "Wheat" | "Cotton" | "Rice" | "Groundnut" | "Mustard" | "Other";
export type Grade = "A" | "B" | "C";
export type Priority = "Low" | "Medium" | "High";

export type Center = {
  id: string;
  name: string;
  location: string;
  village: string;
  latitude?: number;
  longitude?: number;
  distanceKm: number;
  dailyCapacity: number;
  bookedToday: number;
  currentQueue: number;
  countersOpen: number;
  countersTotal: number;
  expectedWaitMin: number;
  processingRatePerHour: number;
  avgWaitMin: number;
  paymentReliability: number;
  reliabilityScore: number;
  onTimePayment: number;
  grievanceResolution: number;
  status: CenterStatus;
  congestion: Congestion;
};

export type Farmer = {
  id: string;
  name: string;
  mobile: string;
  village: string;
  crop: Crop;
  status: FarmerStatus;
  creditScore?: number;
  email?: string;
};

export type TimeSlot = {
  id: string;
  centerId: string;
  date: string;
  start: string;
  end: string;
  booked: number;
  capacity: number;
  state: SlotState;
};

export type Booking = {
  id: string;
  farmerId: string;
  crop: Crop;
  quantityKg: number;
  centerId: string;
  date: string;
  time: string;
  slotId: string;
  status: BookingStatus;
  expectedWaitMin: number;
};

export type ProduceEvent = {
  key: "received" | "graded" | "approved" | "processing" | "paid";
  label: string;
  at?: string;
  expected?: string;
  done: boolean;
  current?: boolean;
};

export type Procurement = {
  id: string;
  farmerId: string;
  bookingId?: string;
  crop: Crop;
  quantityKg: number;
  acceptedQuantityKg?: number;
  pricePerKg?: number;
  qualityDeductionPercent?: number;
  estimatedAmount?: number;
  centerId: string;
  date: string;
  time: string;
  lotId: string;
  grade: Grade;
  moisture: number;
  foreignMaterial: number;
  damaged: number;
  gradeReason: string;
  status: ProcurementStatus;
  timeline: ProduceEvent[];
};

export type Payment = {
  id: string;
  farmerId: string;
  procurementId: string;
  crop: Crop;
  amount: number;
  date: string;
  expectedDate: string;
  status: PaymentStatus;
};

export type NotificationItem = {
  id: string;
  farmerId: string;
  title: string;
  body: string;
  type: "slot" | "center" | "payment" | "delay" | "system";
  read: boolean;
  createdAt: string;
};

export type Grievance = {
  id: string;
  farmerId: string;
  procurementId?: string;
  category: GrievanceCategory;
  description: string;
  status: GrievanceStatus;
  priority: Priority;
  createdAt: string;
  assignedTo?: string;
  timeline: { label: string; at: string; done: boolean }[];
};

export type AppUser = {
  role: Role;
  farmerId?: string;
  name: string;
  email: string;
};

export type AppState = {
  user: AppUser | null;
  lang: Lang;
  farmers: Farmer[];
  centers: Center[];
  slots: TimeSlot[];
  bookings: Booking[];
  procurements: Procurement[];
  payments: Payment[];
  notifications: NotificationItem[];
  grievances: Grievance[];
  recommendationDismissed: boolean;
  nextBookingSeq: number;
  nextGrievanceSeq: number;
};
