"use client";

import { useEffect } from "react";

export default function TempAdminPage() {
  useEffect(() => {
    window.location.replace("/mon-profil");
  }, []);

  return null;
}
