"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

export default function ProfilePage() {
  const { state, logout } = useAppStore();
  const router = useRouter();
  const farmer = state.farmers[0];
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Profile</h1>
      <Card className="p-5 space-y-2">
        <p><b>Name:</b> {farmer.name}</p>
        <p><b>Email:</b> {state.user?.email}</p>
        <p><b>Farmer ID:</b> {farmer.id}</p>
        <p><b>Mobile:</b> {farmer.mobile}</p>
        <p><b>Village:</b> {farmer.village}</p>
        <p><b>Main crop:</b> {farmer.crop}</p>
        <p><b>Status:</b> {farmer.status}</p>
      </Card>
      <Button
        variant="outline"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        Logout
      </Button>
    </div>
  );
}
