"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { api } from "@/lib/api";

export default function AdminAlertsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("system");
  const [farmerId, setFarmerId] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/alerts.php", { action: "create", title, body, type, farmerId: farmerId || undefined });
      toast.success(farmerId ? "Alert sent to the farmer" : "Alert broadcast to all farmers");
      setTitle("");
      setBody("");
      setFarmerId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send alert");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl">Farmer alerts</h1>
      <Card className="p-5">
        <p className="text-sm text-[#5c6f68]">Send an operational update to every farmer or one farmer by numeric farmer ID.</p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <div><Label htmlFor="alert-title">Title</Label><Input id="alert-title" value={title} onChange={(event) => setTitle(event.target.value)} required /></div>
          <div><Label htmlFor="alert-body">Message</Label><Textarea id="alert-body" value={body} onChange={(event) => setBody(event.target.value)} required /></div>
          <div>
            <Label htmlFor="alert-type">Alert type</Label>
            <Select id="alert-type" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="system">General</option>
              <option value="slot">Slot</option>
              <option value="center">Center</option>
              <option value="payment">Payment</option>
              <option value="delay">Delay</option>
            </Select>
          </div>
          <div><Label htmlFor="farmer-id">Farmer ID (optional)</Label><Input id="farmer-id" inputMode="numeric" placeholder="Leave empty to broadcast" value={farmerId} onChange={(event) => setFarmerId(event.target.value)} /></div>
          <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Send alert"}</Button>
        </form>
      </Card>
    </div>
  );
}
