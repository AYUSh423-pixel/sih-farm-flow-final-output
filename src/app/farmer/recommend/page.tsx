"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { congestionLabel, congestionTone } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import type { Center } from "@/lib/types";

function distanceBetween(latitude: number, longitude: number, center: Center) {
  if (center.latitude === undefined || center.longitude === undefined) return center.distanceKm;
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(center.latitude - latitude);
  const longitudeDelta = toRadians(center.longitude - longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitude)) * Math.cos(toRadians(center.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RecommendPage() {
  const { state } = useAppStore();
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("Location not enabled yet. Showing saved center distances.");

  useEffect(() => {
    void api.get<{ centers: Center[] }>("/centers.php", { centers: [] }).then((result) => setCenters(result.centers));
  }, []);

  function useLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("GPS is not available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (current) => {
        setPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude });
        setLocationMessage("Showing centers nearest to your current location.");
        setLocating(false);
      },
      () => {
        setLocationMessage("Location permission was not granted. Showing saved center distances.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  const ranked = useMemo(() => centers.map((center) => ({
    center,
    nearbyDistance: position ? distanceBetween(position.latitude, position.longitude, center) : center.distanceKm,
  })).sort((a, b) => a.nearbyDistance - b.nearbyDistance), [centers, position]);
  const best = ranked[0];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">{t(state.lang, "whereGo")}</h1>
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">Find nearby procurement centers</p>
          <p className="text-sm text-[#5c6f68]">{locationMessage}</p>
        </div>
        <Button onClick={useLocation} disabled={locating}>{locating ? "Finding you…" : "Use my GPS location"}</Button>
      </div>
      {best && <Card className="border-[var(--primary)] bg-[var(--sage)] p-5">
        <Badge tone="good">⭐ Nearest center</Badge>
        <p className="mt-2 text-2xl font-bold">{best.center.name}</p>
        <p className="mt-1">{best.center.location}</p>
        <p className="mt-2 text-sm">{best.nearbyDistance.toFixed(1)} km away · Expected wait ~{best.center.expectedWaitMin} min</p>
        <Button className="mt-4" onClick={() => router.push(`/farmer/book?center=${best.center.id}`)}>
          {t(state.lang, "bookRecommended")}
        </Button>
      </Card>}
      {ranked.map(({ center: c, nearbyDistance }) => (
        <Card key={c.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-sm text-[#5c6f68]">{c.location} · {nearbyDistance.toFixed(1)} km away</p>
            </div>
            <Badge tone={congestionTone(c.congestion)}>
              {c.congestion === "low" ? "🟢" : c.congestion === "medium" ? "🟡" : "🔴"} {congestionLabel(c.congestion)}
            </Badge>
          </div>
          <p className="mt-2 font-semibold">
            Expected wait: {c.expectedWaitMin >= 60 ? `${Math.floor(c.expectedWaitMin / 60)} hr ${c.expectedWaitMin % 60} min` : `${c.expectedWaitMin} min`}
          </p>
          <p className="text-sm">Capacity: {Math.round((c.bookedToday / c.dailyCapacity) * 100)}%</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push(`/farmer/book?center=${c.id}`)}>Book this center</Button>
            {c.latitude !== undefined && c.longitude !== undefined && <a className="inline-flex h-10 items-center rounded-xl border border-[var(--line)] px-4 text-sm font-semibold" href={`https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`} target="_blank" rel="noreferrer">Open map</a>}
          </div>
        </Card>
      ))}
    </div>
  );
}
