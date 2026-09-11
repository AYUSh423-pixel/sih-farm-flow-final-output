"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppState,
  Booking,
  Crop,
  Farmer,
  GrievanceCategory,
  Lang,
  PaymentStatus,
  ProcurementStatus,
  Role,
} from "./types";
import { createInitialState } from "./mock-data";
import { pad } from "./utils";

const STORAGE_KEY = "farm-flow-state-v1";

type Store = {
  state: AppState;
  ready: boolean;
  login: (role: Role, name?: string, email?: string, farmerId?: string) => void;
  logout: () => void;
  setLang: (lang: Lang) => void;
  bookSlot: (input: {
    id?: string;
    farmerId: string;
    crop: Crop;
    quantityKg: number;
    centerId: string;
    date: string;
    slotId: string;
    time: string;
    expectedWaitMin: number;
  }) => Booking;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, slotId: string, date: string, time: string) => void;
  replaceBookings: (bookings: Booking[]) => void;
  replaceCenters: (centers: AppState["centers"]) => void;
  updateCenter: (center: AppState["centers"][number]) => void;
  replaceProcurements: (procurements: AppState["procurements"]) => void;
  replaceFarmers: (farmers: AppState["farmers"]) => void;
  raiseGrievance: (input: {
    id?: string;
    farmerId: string;
    procurementId?: string;
    category: GrievanceCategory;
    description: string;
  }) => string;
  markRead: (id: string) => void;
  markAllRead: (farmerId: string) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  updateProcurementStatus: (id: string, status: ProcurementStatus) => void;
  assignGrievance: (id: string, officer: string) => void;
  resolveGrievance: (id: string) => void;
  escalateGrievance: (id: string) => void;
  closeSlot: (id: string) => void;
  increaseSlotCapacity: (id: string, extra: number) => void;
  applyCapacityRecommendation: () => void;
  dismissRecommendation: () => void;
  addFarmer: (farmer: Omit<Farmer, "id">) => void;
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);

function persist(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed.user && !parsed.user.email) {
          parsed.user.email = parsed.user.role === "farmer" ? "ramesh.patel@farmflow.in" : "officer.mehta@farmflow.in";
        }
        if (parsed.user?.farmerId?.startsWith("FF-F-")) {
          parsed.user.farmerId = String(Number(parsed.user.farmerId.slice(5)));
        }
        setState({ ...createInitialState(), ...parsed });
      }
    } catch {
      /* keep seed */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) persist(state);
  }, [state, ready]);

  const patch = useCallback((fn: (s: AppState) => AppState) => {
    setState((s) => fn(s));
  }, []);

  const login = useCallback((role: Role, name?: string, email?: string, farmerId?: string) => {
    patch((s) => ({
      ...s,
      user:
        role === "farmer"
          ? { role, farmerId: farmerId || "1", name: name || "Ramesh Patel", email: email || "ramesh.patel@farmflow.in" }
          : { role, name: name || "Officer Mehta", email: email || "officer.mehta@farmflow.in" },
    }));
  }, [patch]);

  const logout = useCallback(() => {
    patch((s) => ({ ...s, user: null }));
  }, [patch]);

  const setLang = useCallback((lang: Lang) => {
    patch((s) => ({ ...s, lang }));
  }, [patch]);

  const bookSlot: Store["bookSlot"] = useCallback((input) => {
    let created: Booking | null = null;
    patch((s) => {
      const id = input.id || `FF-2026-${pad(s.nextBookingSeq, 6)}`;
      created = {
        id,
        farmerId: input.farmerId,
        crop: input.crop,
        quantityKg: input.quantityKg,
        centerId: input.centerId,
        date: input.date,
        time: input.time,
        slotId: input.slotId,
        status: "Confirmed",
        expectedWaitMin: input.expectedWaitMin,
      };
      return {
        ...s,
        nextBookingSeq: s.nextBookingSeq + 1,
        bookings: [created, ...s.bookings],
        slots: s.slots.map((slot) => {
          if (slot.id !== input.slotId) return slot;
          const booked = Math.min(slot.capacity, slot.booked + 1);
          const ratio = booked / slot.capacity;
          return {
            ...slot,
            booked,
            state: ratio >= 1 ? "FULL" : ratio >= 0.8 ? "LIMITED" : "AVAILABLE",
          };
        }),
        notifications: [
          {
            id: `N-${Date.now()}`,
            farmerId: input.farmerId,
            title: "Slot booked",
            body: `Booking ${id} confirmed at ${input.time}.`,
            type: "slot",
            read: false,
            createdAt: "2026-09-11 19:00",
          },
          ...s.notifications,
        ],
      };
    });
    return created!;
  }, [patch]);

  const cancelBooking = useCallback((id: string) => {
    patch((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b)),
    }));
  }, [patch]);

  const rescheduleBooking = useCallback(
    (id: string, slotId: string, date: string, time: string) => {
      patch((s) => ({
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === id ? { ...b, slotId, date, time, status: "Rescheduled" } : b,
        ),
      }));
    },
    [patch],
  );

  const replaceBookings = useCallback((bookings: Booking[]) => {
    patch((s) => ({ ...s, bookings }));
  }, [patch]);

  const replaceCenters = useCallback((centers: AppState["centers"]) => {
    patch((s) => ({ ...s, centers }));
  }, [patch]);

  const updateCenter = useCallback((center: AppState["centers"][number]) => {
    patch((s) => ({ ...s, centers: s.centers.map((item) => item.id === center.id ? center : item) }));
  }, [patch]);

  const replaceProcurements = useCallback((procurements: AppState["procurements"]) => {
    patch((s) => ({ ...s, procurements }));
  }, [patch]);

  const replaceFarmers = useCallback((farmers: AppState["farmers"]) => {
    patch((s) => ({ ...s, farmers }));
  }, [patch]);

  const raiseGrievance: Store["raiseGrievance"] = useCallback((input) => {
    let gid = "";
    patch((s) => {
      gid = input.id || `GRV-2026-${pad(s.nextGrievanceSeq, 5)}`;
      return {
        ...s,
        nextGrievanceSeq: s.nextGrievanceSeq + 1,
        grievances: [
          {
            id: gid,
            farmerId: input.farmerId,
            procurementId: input.procurementId,
            category: input.category,
            description: input.description,
            status: "Open",
            priority: input.category === "Payment Delay" ? "High" : "Medium",
            createdAt: "2026-09-11",
            timeline: [
              { label: "Submitted", at: "11 Sep, 3:56 AM", done: true },
              { label: "Assigned", at: "", done: false },
              { label: "In Progress", at: "", done: false },
              { label: "Resolved", at: "", done: false },
            ],
          },
          ...s.grievances,
        ],
        notifications: [
          {
            id: `N-g-${Date.now()}`,
            farmerId: input.farmerId,
            title: "Grievance submitted",
            body: `Grievance ${gid} is open.`,
            type: "system",
            read: false,
            createdAt: "2026-09-11 19:05",
          },
          ...s.notifications,
        ],
      };
    });
    return gid;
  }, [patch]);

  const markRead = useCallback((id: string) => {
    patch((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, [patch]);

  const markAllRead = useCallback((farmerId: string) => {
    patch((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.farmerId === farmerId ? { ...n, read: true } : n,
      ),
    }));
  }, [patch]);

  const updatePaymentStatus = useCallback((id: string, status: PaymentStatus) => {
    patch((s) => {
      const payment = s.payments.find((p) => p.id === id);
      return {
        ...s,
        payments: s.payments.map((p) => (p.id === id ? { ...p, status } : p)),
        procurements: s.procurements.map((pr) => {
          if (!payment || pr.id !== payment.procurementId) return pr;
          if (status === "Paid") {
            return {
              ...pr,
              status: "Paid",
              timeline: pr.timeline.map((ev) =>
                ev.key === "processing" || ev.key === "paid"
                  ? { ...ev, done: true, current: false, at: ev.at || "11 Sep, 4:10 PM" }
                  : { ...ev, current: false },
              ),
            };
          }
          return pr;
        }),
      };
    });
  }, [patch]);

  const updateProcurementStatus = useCallback((id: string, status: ProcurementStatus) => {
    patch((s) => ({
      ...s,
      procurements: s.procurements.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
  }, [patch]);

  const assignGrievance = useCallback((id: string, officer: string) => {
    patch((s) => ({
      ...s,
      grievances: s.grievances.map((g) =>
        g.id === id
          ? {
              ...g,
              assignedTo: officer,
              status: "In Progress",
              timeline: g.timeline.map((t) =>
                t.label === "Assigned" || t.label === "In Progress"
                  ? { ...t, done: true, at: t.at || "11 Sep" }
                  : t,
              ),
            }
          : g,
      ),
    }));
  }, [patch]);

  const resolveGrievance = useCallback((id: string) => {
    patch((s) => ({
      ...s,
      grievances: s.grievances.map((g) =>
        g.id === id
          ? {
              ...g,
              status: "Resolved",
              timeline: g.timeline.map((t) => ({ ...t, done: true, at: t.at || "11 Sep" })),
            }
          : g,
      ),
    }));
  }, [patch]);

  const escalateGrievance = useCallback((id: string) => {
    patch((s) => ({
      ...s,
      grievances: s.grievances.map((g) =>
        g.id === id ? { ...g, status: "Escalated", priority: "High" } : g,
      ),
    }));
  }, [patch]);

  const closeSlot = useCallback((id: string) => {
    patch((s) => ({
      ...s,
      slots: s.slots.map((sl) => (sl.id === id ? { ...sl, state: "CLOSED" } : sl)),
    }));
  }, [patch]);

  const increaseSlotCapacity = useCallback((id: string, extra: number) => {
    patch((s) => ({
      ...s,
      slots: s.slots.map((sl) => {
        if (sl.id !== id) return sl;
        const capacity = sl.capacity + extra;
        const ratio = sl.booked / capacity;
        return {
          ...sl,
          capacity,
          state: ratio >= 1 ? "FULL" : ratio >= 0.8 ? "LIMITED" : "AVAILABLE",
        };
      }),
    }));
  }, [patch]);

  const applyCapacityRecommendation = useCallback(() => {
    patch((s) => ({
      ...s,
      recommendationDismissed: true,
      centers: s.centers.map((c) => {
        if (c.id === "C-B") {
          return { ...c, dailyCapacity: c.dailyCapacity + 20, congestion: "low", expectedWaitMin: 36 };
        }
        if (c.id === "C-C") {
          return { ...c, bookedToday: Math.max(0, c.bookedToday - 18), congestion: "medium", expectedWaitMin: 78 };
        }
        return c;
      }),
      slots: s.slots.map((sl) => {
        if (sl.centerId === "C-B" && sl.date === "2026-09-11") {
          const capacity = sl.capacity + 4;
          const ratio = sl.booked / capacity;
          return {
            ...sl,
            capacity,
            state: ratio >= 1 ? "FULL" : ratio >= 0.8 ? "LIMITED" : "AVAILABLE",
          };
        }
        return sl;
      }),
    }));
  }, [patch]);

  const dismissRecommendation = useCallback(() => {
    patch((s) => ({ ...s, recommendationDismissed: true }));
  }, [patch]);

  const addFarmer = useCallback((farmer: Omit<Farmer, "id">) => {
    patch((s) => ({
      ...s,
      farmers: [
        {
          ...farmer,
          id: `FF-F-${pad(s.farmers.length + 1, 4)}`,
        },
        ...s.farmers,
      ],
    }));
  }, [patch]);

  const resetDemo = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    persist(fresh);
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      login,
      logout,
      setLang,
      bookSlot,
      cancelBooking,
      rescheduleBooking,
      replaceBookings,
      replaceCenters,
      updateCenter,
      replaceProcurements,
      replaceFarmers,
      raiseGrievance,
      markRead,
      markAllRead,
      updatePaymentStatus,
      updateProcurementStatus,
      assignGrievance,
      resolveGrievance,
      escalateGrievance,
      closeSlot,
      increaseSlotCapacity,
      applyCapacityRecommendation,
      dismissRecommendation,
      addFarmer,
      resetDemo,
    }),
    [
      state,
      ready,
      login,
      logout,
      setLang,
      bookSlot,
      cancelBooking,
      rescheduleBooking,
      replaceBookings,
      replaceCenters,
      updateCenter,
      replaceProcurements,
      replaceFarmers,
      raiseGrievance,
      markRead,
      markAllRead,
      updatePaymentStatus,
      updateProcurementStatus,
      assignGrievance,
      resolveGrievance,
      escalateGrievance,
      closeSlot,
      increaseSlotCapacity,
      applyCapacityRecommendation,
      dismissRecommendation,
      addFarmer,
      resetDemo,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
