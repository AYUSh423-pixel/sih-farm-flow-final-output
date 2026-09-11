"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  const { resetDemo } = useAppStore();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Settings</h1>
      <Card className="space-y-3 p-5">
        <p className="font-bold">Operations desk</p>
        <div>
          <Label>Default language</Label>
          <Select defaultValue="en">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
          </Select>
        </div>
        <div>
          <Label>Payment SLA (hours)</Label>
          <Input defaultValue="48" />
        </div>
        <Button
          onClick={() => {
            toast.success("Settings saved (demo)");
          }}
        >
          Save settings
        </Button>
      </Card>
      <Card className="p-5">
        <p className="font-bold">Demo data</p>
        <p className="text-sm text-[#5c6f68]">Reset bookings, grievances, and queue changes from this session.</p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            resetDemo();
            toast.success("Demo data restored");
          }}
        >
          Reset demo
        </Button>
      </Card>
    </div>
  );
}
