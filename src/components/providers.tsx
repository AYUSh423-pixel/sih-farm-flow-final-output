"use client";

import { Toaster } from "sonner";
import { AppStoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      {children}
      <Toaster richColors position="top-center" />
    </AppStoreProvider>
  );
}
