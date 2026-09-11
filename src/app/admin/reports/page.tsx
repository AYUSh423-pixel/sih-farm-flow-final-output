"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/misc";
import { api } from "@/lib/api";

type ReportsData = {
  waiting: Record<string, string | number>[];
  volume: Record<string, string | number>[];
  paymentTime: Record<string, string | number>[];
  utilization: Record<string, string | number>[];
  grievances: Record<string, string | number>[];
  bookings: Record<string, string | number>[];
};

export default function ReportsPage() {
  const [range, setRange] = useState("7");
  const [data, setData] = useState<ReportsData | null>(null);

  useEffect(() => {
    setData(null);
    void api.get<ReportsData>(`/reports.php?range=${range}`, {
      waiting: [], volume: [], paymentTime: [], utilization: [], grievances: [], bookings: [],
    }).then(setData);
  }, [range]);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl">Reports & analytics</h1>
      <Tabs
        value={range}
        onChange={setRange}
        tabs={[
          { id: "1", label: "Today" },
          { id: "7", label: "7 Days" },
          { id: "30", label: "30 Days" },
        ]}
      />
      <p className="text-sm text-[#5c6f68]">Live database reports for the selected window ({range === "1" ? "today" : `${range} days`}).</p>
      {!data ? <p className="text-[#5c6f68]">Loading reports…</p> : <>
        <Grid title="Average waiting time by center" data={data.waiting} x="center" y="wait" />
        <Grid title="Daily procurement volume" data={data.volume} x="day" y="volume" line />
        <Grid title="Payment processing time" data={data.paymentTime} x="day" y="hours" line />
        <Grid title="Center capacity utilization" data={data.utilization} x="name" y="util" />
        <Grid title="Grievance resolution time" data={data.grievances} x="type" y="days" />
        <Grid title="Farmer booking trends" data={data.bookings} x="day" y="bookings" line />
      </>}
    </div>
  );
}

function Grid({
  title,
  data,
  x,
  y,
  line,
}: {
  title: string;
  data: Record<string, string | number>[];
  x: string;
  y: string;
  line?: boolean;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          {line ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e3db" />
              <XAxis dataKey={x} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={y} stroke="#1f7a4d" strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e3db" />
              <XAxis dataKey={x} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={y} fill="#1f7a4d" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
