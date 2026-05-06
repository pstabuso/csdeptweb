"use client";

import { useEffect, useState } from "react";

function formatManilaNow() {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export function SidebarClock() {
  const [value, setValue] = useState(formatManilaNow);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setValue(formatManilaNow());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return <span>{value}</span>;
}
