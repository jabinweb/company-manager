"use client";
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-grow">
        <LandingHero />
        <Features />
      </main>
      <LandingFooter />
    </div>
  );
}
