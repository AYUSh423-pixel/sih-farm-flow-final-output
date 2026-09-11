import { FarmerShell } from "@/components/farmer-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FarmerShell>{children}</FarmerShell>;
}
