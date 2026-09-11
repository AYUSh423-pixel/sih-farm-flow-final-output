"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { api } from "@/lib/api";
import type { Center } from "@/lib/types";

export default function GovernmentSignupPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [centerId, setCenterId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void api.get<{ centers: Center[] }>("/centers.php", { centers: [] }).then((result) => {
      setCenters(result.centers);
      if (result.centers[0]) setCenterId(result.centers[0].id);
    });
  }, []);

  async function submit() {
    setLoading(true);
    try {
      await api.post("/admin-register.php", { name, email, centerId, password });
      toast.success("Government admin account created. You can now sign in.");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create government account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--canvas)] px-5 py-10">
      <Card className="w-full max-w-lg p-6">
        <Logo />
        <p className="mt-6 text-sm font-semibold tracking-[0.16em] text-[var(--primary)]">GOVERNMENT ACCESS</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Create admin portal access</h1>
        <p className="mt-2 text-sm text-[#5c6f68]">Register an authorized procurement-center officer.</p>
        <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <div><Label htmlFor="name">Officer name</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} required /></div>
          <div><Label htmlFor="email">Official email</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div>
            <Label htmlFor="centerId">Government procurement center</Label>
            <Select id="centerId" value={centerId} onChange={(event) => setCenterId(event.target.value)} required>
              {centers.map((center) => <option key={center.id} value={center.id}>{center.id} · {center.name}</option>)}
            </Select>
          </div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          <Button className="w-full" type="submit" disabled={loading || centers.length === 0}>{loading ? "Creating account…" : "Create government account"}</Button>
          <Button className="w-full" type="button" variant="outline" onClick={() => router.push("/")}>Back to sign in</Button>
        </form>
      </Card>
    </main>
  );
}
