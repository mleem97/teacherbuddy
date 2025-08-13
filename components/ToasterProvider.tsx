"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      expand={false}
      duration={4000}
      closeButton={false}
    />
  );
}