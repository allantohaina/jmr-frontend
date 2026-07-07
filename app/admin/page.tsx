"use client";

import { useEffect } from "react";

export default function AdminHoneypot() {
  useEffect(() => {
    console.warn("[SECURITY ALERT] Unauthorized access attempt to legacy /admin URL.");
    window.location.replace("/");
  }, []);

  return null;
}
