"use client";
import { Suspense } from "react";
import { LocationInner } from "./inner";
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-teal animate-pulse sora">Carregando...</div></div>}>
      <LocationInner />
    </Suspense>
  );
}
