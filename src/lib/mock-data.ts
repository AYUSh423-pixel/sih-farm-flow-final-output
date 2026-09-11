import type {
  AppState,
  Booking,
  Center,
  Crop,
  Farmer,
  Grievance,
  NotificationItem,
  Payment,
  Procurement,
  ProduceEvent,
  TimeSlot,
} from "./types";
import { pad } from "./utils";

export const DEMO_FARMER_ID = "FF-F-0001";
export const DEMO_BOOKING_ID = "FF-2026-004281";
export const DEMO_PROCUREMENT_ID = "FF-P-004281";
export const DEMO_GRIEVANCE_ID = "GRV-2026-00281";
export const TODAY = "2026-09-11";
export const TOMORROW = "2026-09-12";
export const YESTERDAY = "2026-09-10";

const crops: Crop[] = ["Wheat", "Cotton", "Rice", "Groundnut", "Mustard"];

const names = [
  ["Ramesh", "Patel"],
  ["Mahesh", "Kumar"],
  ["Kavita", "Sharma"],
  ["Arjun", "Desai"],
  ["Sita", "Ben"],
  ["Harish", "Joshi"],
  ["Meena", "Patel"],
  ["Vijay", "Solanki"],
  ["Pooja", "Raval"],
  ["Kiran", "Thakor"],
  ["Nilesh", "Chauhan"],
  ["Rekha", "Gohil"],
  ["Sanjay", "Parmar"],
  ["Anjali", "Shah"],
  ["Bhavesh", "Patel"],
  ["Geeta", "Dave"],
  ["Prakash", "Vaghela"],
  ["Lata", "Barot"],
  ["Deepak", "Trivedi"],
  ["Sunita", "Modi"],
  ["Rakesh", "Zala"],
  ["Nisha", "Panchal"],
  ["Yogesh", "Patil"],
  ["Alka", "Bhatt"],
  ["Mohan", "Rathod"],
  ["Seema", "Jani"],
  ["Dinesh", "Jadeja"],
  ["Komal", "Mehta"],
  ["Ashok", "Patel"],
  ["Bharti", "Soni"],
  ["Jignesh", "Patel"],
  ["Hetal", "Vyas"],
  ["Gopal", "Chaudhary"],
  ["Usha", "Prajapati"],
  ["Naresh", "Makwana"],
  ["Payal", "Desai"],
  ["Hitesh", "Rana"],
  ["Manisha", "Gajjar"],
  ["Kamlesh", "Patel"],
  ["Sharda", "Brahmbhatt"],
  ["Paresh", "Dave"],
  ["Falguni", "Shah"],
  ["Rajesh", "Koli"],
  ["Varsha", "Patel"],
  ["Chetan", "Bhavsar"],
  ["Ilaben", "Patel"],
  ["Suresh", "Gadhvi"],
  ["Nayana", "Joshi"],
  ["Tushar", "Patel"],
  ["Darshana", "Raval"],
  ["Amit", "Prajapati"],
  ["Bhavna", "Solanki"],
];

const villages = [
  "Sanand",
  "Kalol",
  "Dholka",
  "Kheda",
  "Mehsana",
  "Nadiad",
  "Anand",
  "Bavla",
  "Viramgam",
  "Dehgam",
  "Mansa",
  "Dhandhuka",
];

export const centers: Center[] = [
  {
    id: "C-A",
    name: "Ahmedabad Procurement Center",
    location: "Naroda, Ahmedabad",
    village: "Ahmedabad",
    distanceKm: 8,
    dailyCapacity: 420,
    bookedToday: 302,
    currentQueue: 18,
    countersOpen: 4,
    countersTotal: 5,
    expectedWaitMin: 24,
    processingRatePerHour: 48,
    avgWaitMin: 28,
    paymentReliability: 96,
    reliabilityScore: 94,
    onTimePayment: 96,
    grievanceResolution: 92,
    status: "Open",
    congestion: "low",
  },
  {
    id: "C-B",
    name: "Gandhinagar Procurement Center",
    location: "Sector 21, Gandhinagar",
    village: "Gandhinagar",
    distanceKm: 5,
    dailyCapacity: 360,
    bookedToday: 302,
    currentQueue: 32,
    countersOpen: 4,
    countersTotal: 5,
    expectedWaitMin: 58,
    processingRatePerHour: 40,
    avgWaitMin: 41,
    paymentReliability: 88,
    reliabilityScore: 61,
    onTimePayment: 78,
    grievanceResolution: 71,
    status: "Busy",
    congestion: "medium",
  },
  {
    id: "C-C",
    name: "Kheda Procurement Center",
    location: "NH-47, Kheda",
    village: "Kheda",
    distanceKm: 12,
    dailyCapacity: 300,
    bookedToday: 288,
    currentQueue: 54,
    countersOpen: 3,
    countersTotal: 4,
    expectedWaitMin: 130,
    processingRatePerHour: 32,
    avgWaitMin: 67,
    paymentReliability: 81,
    reliabilityScore: 54,
    onTimePayment: 74,
    grievanceResolution: 63,
    status: "Busy",
    congestion: "high",
  },
  {
    id: "C-D",
    name: "Nadiad Procurement Center",
    location: "College Road, Nadiad",
    village: "Nadiad",
    distanceKm: 18,
    dailyCapacity: 280,
    bookedToday: 118,
    currentQueue: 7,
    countersOpen: 4,
    countersTotal: 4,
    expectedWaitMin: 14,
    processingRatePerHour: 36,
    avgWaitMin: 22,
    paymentReliability: 91,
    reliabilityScore: 82,
    onTimePayment: 90,
    grievanceResolution: 85,
    status: "Open",
    congestion: "low",
  },
  {
    id: "C-E",
    name: "Anand Procurement Center",
    location: "Milk City Road, Anand",
    village: "Anand",
    distanceKm: 22,
    dailyCapacity: 340,
    bookedToday: 208,
    currentQueue: 16,
    countersOpen: 5,
    countersTotal: 5,
    expectedWaitMin: 31,
    processingRatePerHour: 44,
    avgWaitMin: 33,
    paymentReliability: 93,
    reliabilityScore: 88,
    onTimePayment: 93,
    grievanceResolution: 88,
    status: "Open",
    congestion: "medium",
  },
  {
    id: "C-F",
    name: "Mehsana Procurement Center",
    location: "Highway Circle, Mehsana",
    village: "Mehsana",
    distanceKm: 28,
    dailyCapacity: 260,
    bookedToday: 141,
    currentQueue: 9,
    countersOpen: 3,
    countersTotal: 4,
    expectedWaitMin: 19,
    processingRatePerHour: 30,
    avgWaitMin: 29,
    paymentReliability: 87,
    reliabilityScore: 76,
    onTimePayment: 84,
    grievanceResolution: 80,
    status: "Open",
    congestion: "low",
  },
];

function slotState(booked: number, capacity: number): TimeSlot["state"] {
  const ratio = booked / capacity;
  if (ratio >= 1) return "FULL";
  if (ratio >= 0.8) return "LIMITED";
  return "AVAILABLE";
}

function makeSlots(): TimeSlot[] {
  const windows = [
    ["08:00", "09:00"],
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],
    ["12:00", "13:00"],
  ];
  const dates = [TODAY, TOMORROW, "2026-09-13"];
  const slots: TimeSlot[] = [];
  for (const center of centers) {
    for (const date of dates) {
      windows.forEach(([start, end], i) => {
        let booked = 20 + ((center.id.charCodeAt(2) + i * 7 + date.length) % 28);
        if (center.id === "C-A" && date === TOMORROW && start === "10:00") booked = 42;
        if (center.id === "C-C") booked = Math.min(50, booked + 18);
        const capacity = 50;
        slots.push({
          id: `${center.id}-${date}-${start}`,
          centerId: center.id,
          date,
          start,
          end,
          booked: Math.min(booked, capacity),
          capacity,
          state: slotState(Math.min(booked, capacity), capacity),
        });
      });
    }
  }
  return slots;
}

function demoTimeline(): ProduceEvent[] {
  return [
    { key: "received", label: "Produce Received", at: "11 Sep, 10:42 AM", done: true },
    { key: "graded", label: "Quality Grading", at: "11 Sep, 11:15 AM", done: true },
    { key: "approved", label: "Approved", at: "11 Sep, 11:42 AM", done: true },
    {
      key: "processing",
      label: "Payment Processing",
      expected: "Expected within 2 days",
      done: false,
      current: true,
    },
    { key: "paid", label: "Paid", done: false },
  ];
}

function genericTimeline(status: Procurement["status"], date: string): ProduceEvent[] {
  const order: ProduceEvent[] = [
    { key: "received", label: "Produce Received", at: `${date.slice(8)} Sep, 10:10 AM`, done: true },
    { key: "graded", label: "Quality Grading", at: `${date.slice(8)} Sep, 10:40 AM`, done: true },
    { key: "approved", label: "Approved", at: `${date.slice(8)} Sep, 11:05 AM`, done: true },
    { key: "processing", label: "Payment Processing", expected: "Within 2 days", done: false },
    { key: "paid", label: "Paid", done: false },
  ];
  if (status === "Received") {
    order[1].done = false;
    order[2].done = false;
    delete order[1].at;
    delete order[2].at;
    order[0].current = true;
  } else if (status === "Graded") {
    order[2].done = false;
    delete order[2].at;
    order[1].current = true;
  } else if (status === "Approved") {
    order[2].current = true;
  } else if (status === "Payment Pending") {
    order[3].current = true;
  } else if (status === "Paid") {
    order[3].done = true;
    order[3].at = `${date.slice(8)} Sep, 04:20 PM`;
    order[4].done = true;
    order[4].at = `${date.slice(8)} Sep, 05:10 PM`;
  }
  return order;
}

export function createInitialState(): AppState {
  const farmers: Farmer[] = names.map(([first, last], i) => ({
    id: `FF-F-${pad(i + 1, 4)}`,
    name: `${first} ${last}`,
    mobile: `98${String(76000000 + i * 137).slice(0, 8)}`,
    village: villages[i % villages.length],
    crop: crops[i % crops.length],
    status: i % 17 === 0 ? "Pending" : i % 23 === 0 ? "Inactive" : "Active",
  }));

  const slots = makeSlots();
  const bookings: Booking[] = [];
  const procurements: Procurement[] = [];
  const payments: Payment[] = [];
  const notifications: NotificationItem[] = [];
  const grievances: Grievance[] = [];

  bookings.push({
    id: DEMO_BOOKING_ID,
    farmerId: DEMO_FARMER_ID,
    crop: "Wheat",
    quantityKg: 250,
    centerId: "C-A",
    date: TOMORROW,
    time: "10:30 – 11:00 AM",
    slotId: "C-A-2026-09-12-10:00",
    status: "Confirmed",
    expectedWaitMin: 24,
  });

  let bookingN = 4282;
  for (let i = 0; i < 110; i++) {
    const farmer = farmers[i % farmers.length];
    const center = centers[i % centers.length];
    const statusPool: Booking["status"][] = [
      "Confirmed",
      "Completed",
      "Completed",
      "Cancelled",
      "Rescheduled",
      "Confirmed",
    ];
    const date = i % 3 === 0 ? TODAY : i % 3 === 1 ? YESTERDAY : TOMORROW;
    bookings.push({
      id: `FF-2026-${pad(bookingN++, 6)}`,
      farmerId: farmer.id,
      crop: farmer.crop,
      quantityKg: 80 + ((i * 17) % 420),
      centerId: center.id,
      date,
      time: ["08:00 – 09:00 AM", "09:00 – 10:00 AM", "10:00 – 11:00 AM", "11:00 – 12:00 PM"][i % 4],
      slotId: slots[i % slots.length].id,
      status: i === 0 ? "Confirmed" : statusPool[i % statusPool.length],
      expectedWaitMin: center.expectedWaitMin,
    });
  }

  procurements.push({
    id: DEMO_PROCUREMENT_ID,
    farmerId: DEMO_FARMER_ID,
    bookingId: "FF-2026-004200",
    crop: "Wheat",
    quantityKg: 250,
    centerId: "C-A",
    date: TODAY,
    time: "10:42 AM",
    lotId: "LOT-AHM-1184",
    grade: "B",
    moisture: 14,
    foreignMaterial: 2,
    damaged: 4,
    gradeReason: "Moisture level exceeded the Grade A threshold.",
    status: "Payment Pending",
    timeline: demoTimeline(),
  });

  const statuses: Procurement["status"][] = [
    "Received",
    "Graded",
    "Approved",
    "Payment Pending",
    "Paid",
    "Paid",
    "Paid",
  ];
  let pN = 4282;
  for (let i = 0; i < 120; i++) {
    const farmer = farmers[(i + 1) % farmers.length];
    const center = centers[i % centers.length];
    const status = statuses[i % statuses.length];
    const date = i % 2 === 0 ? TODAY : i % 3 === 0 ? YESTERDAY : "2026-09-08";
    const grade: Procurement["grade"] = i % 5 === 0 ? "C" : i % 3 === 0 ? "B" : "A";
    procurements.push({
      id: `FF-P-${pad(pN++, 6)}`,
      farmerId: farmer.id,
      crop: farmer.crop,
      quantityKg: 90 + ((i * 23) % 500),
      centerId: center.id,
      date,
      time: "11:00 AM",
      lotId: `LOT-${center.id}-${1000 + i}`,
      grade,
      moisture: grade === "A" ? 11 : grade === "B" ? 14 : 16,
      foreignMaterial: grade === "A" ? 0.8 : 2,
      damaged: grade === "A" ? 1 : 4,
      gradeReason:
        grade === "A"
          ? "All quality parameters are within Grade A limits."
          : grade === "B"
            ? "Moisture level exceeded the Grade A threshold."
            : "Damaged produce is above the acceptable Grade B limit.",
      status,
      timeline: genericTimeline(status, date),
    });
  }

  payments.push({
    id: "PAY-004281",
    farmerId: DEMO_FARMER_ID,
    procurementId: DEMO_PROCUREMENT_ID,
    crop: "Wheat",
    amount: 12500,
    date: TODAY,
    expectedDate: "2026-09-09",
    status: "Delayed",
  });

  let payN = 4282;
  for (let i = 1; i < procurements.length; i++) {
    const p = procurements[i];
    const status: Payment["status"] =
      p.status === "Paid" ? "Paid" : p.status === "Payment Pending" ? (i % 7 === 0 ? "Delayed" : "Processing") : "Processing";
    payments.push({
      id: `PAY-${pad(payN++, 6)}`,
      farmerId: p.farmerId,
      procurementId: p.id,
      crop: p.crop,
      amount: Math.round(p.quantityKg * (p.crop === "Cotton" ? 62 : 48)),
      date: p.date,
      expectedDate: p.date,
      status: p.status === "Received" || p.status === "Graded" ? "Processing" : status,
    });
  }

  notifications.push(
    {
      id: "N-1",
      farmerId: DEMO_FARMER_ID,
      title: "Slot Reminder",
      body: "Your procurement slot is tomorrow at 10:30 AM.",
      type: "slot",
      read: false,
      createdAt: `${TODAY} 18:00`,
    },
    {
      id: "N-2",
      farmerId: DEMO_FARMER_ID,
      title: "Center Update",
      body: "Ahmedabad Procurement Center is operating normally.",
      type: "center",
      read: false,
      createdAt: `${TODAY} 16:20`,
    },
    {
      id: "N-3",
      farmerId: DEMO_FARMER_ID,
      title: "Payment Update",
      body: "Your payment is being processed.",
      type: "payment",
      read: false,
      createdAt: `${TODAY} 12:05`,
    },
    {
      id: "N-4",
      farmerId: DEMO_FARMER_ID,
      title: "Delay Alert",
      body: "Payment for Procurement ID FF-P-004281 is delayed.",
      type: "delay",
      read: false,
      createdAt: `${TODAY} 09:10`,
    },
  );

  const categories: Grievance["category"][] = [
    "Payment Delay",
    "Incorrect Grading",
    "Slot Problem",
    "Center Problem",
    "Other",
  ];
  const gStatuses: Grievance["status"][] = ["Open", "In Progress", "Resolved", "Escalated"];
  for (let i = 0; i < 22; i++) {
    const farmer = farmers[(i + 3) % farmers.length];
    const status = gStatuses[i % gStatuses.length];
    const id = i === 0 ? DEMO_GRIEVANCE_ID : `GRV-2026-${pad(282 + i, 5)}`;
    grievances.push({
      id,
      farmerId: farmer.id,
      procurementId: procurements[(i + 4) % procurements.length].id,
      category: categories[i % categories.length],
      description:
        i === 0
          ? "Payment for wheat lot has not arrived after the promised date."
          : `${categories[i % categories.length]} reported at the procurement center.`,
      status,
      priority: i % 4 === 0 ? "High" : i % 3 === 0 ? "Medium" : "Low",
      createdAt: i < 5 ? TODAY : YESTERDAY,
      assignedTo: status === "Open" ? undefined : "Officer Mehta",
      timeline: [
        { label: "Submitted", at: YESTERDAY, done: true },
        { label: "Assigned", at: status === "Open" ? "" : YESTERDAY, done: status !== "Open" },
        {
          label: "In Progress",
          at: status === "In Progress" || status === "Resolved" || status === "Escalated" ? TODAY : "",
          done: status === "In Progress" || status === "Resolved" || status === "Escalated",
        },
        { label: "Resolved", at: status === "Resolved" ? TODAY : "", done: status === "Resolved" },
      ],
    });
  }

  return {
    user: null,
    lang: "en",
    farmers,
    centers,
    slots,
    bookings,
    procurements,
    payments,
    notifications,
    grievances,
    recommendationDismissed: false,
    nextBookingSeq: bookingN,
    nextGrievanceSeq: 304,
  };
}

export const queueTrend = [
  { hour: "8 AM", wait: 18 },
  { hour: "9 AM", wait: 22 },
  { hour: "10 AM", wait: 24 },
  { hour: "11 AM", wait: 31 },
  { hour: "12 PM", wait: 36 },
  { hour: "1 PM", wait: 29 },
];

export const reportWaiting = [
  { center: "Ahmedabad", wait: 28 },
  { center: "Gandhinagar", wait: 41 },
  { center: "Kheda", wait: 67 },
  { center: "Nadiad", wait: 22 },
  { center: "Anand", wait: 33 },
  { center: "Mehsana", wait: 29 },
];

export const reportVolume = [
  { day: "5 Sep", volume: 210 },
  { day: "6 Sep", volume: 248 },
  { day: "7 Sep", volume: 232 },
  { day: "8 Sep", volume: 271 },
  { day: "9 Sep", volume: 255 },
  { day: "10 Sep", volume: 268 },
  { day: "11 Sep", volume: 286 },
];

export const reportPaymentTime = [
  { day: "5 Sep", hours: 18 },
  { day: "6 Sep", hours: 22 },
  { day: "7 Sep", hours: 19 },
  { day: "8 Sep", hours: 26 },
  { day: "9 Sep", hours: 31 },
  { day: "10 Sep", hours: 24 },
  { day: "11 Sep", hours: 21 },
];

export const reportBookings = [
  { day: "5 Sep", bookings: 48 },
  { day: "6 Sep", bookings: 61 },
  { day: "7 Sep", bookings: 54 },
  { day: "8 Sep", bookings: 70 },
  { day: "9 Sep", bookings: 66 },
  { day: "10 Sep", bookings: 72 },
  { day: "11 Sep", bookings: 81 },
];

export const reportGrievanceTime = [
  { type: "Payment", days: 2.1 },
  { type: "Grading", days: 1.4 },
  { type: "Slot", days: 0.8 },
  { type: "Center", days: 1.9 },
];
