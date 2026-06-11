"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  Home,
  MapPin,
  MessageCircle,
  Store,
  Users,
} from "lucide-react";
import { MobileFrame } from "./MobileFrame";
import { StatusBar } from "./StatusBar";
import { useOnboardingStore } from "@/lib/store";

function PlusGlyph({ size = 21 }: { size?: number }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-current" />
    </span>
  );
}

function ClockGlyph() {
  return (
    <span className="relative inline-block h-3 w-3 rounded-full border border-current">
      <span className="absolute left-1/2 top-[2px] h-[4px] w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-1/2 top-1/2 h-px w-[4px] bg-current" />
    </span>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 border-r border-[#D9DDE4] text-center last:border-r-0">
      <div className="text-[12px] leading-4 text-[#1C1814]">{label}</div>
      <div className="mt-1 text-[20px] font-bold leading-6 text-[#1C1814]">{value}</div>
    </div>
  );
}

export function FigmaHomeScreen() {
  const router = useRouter();
  const state = useOnboardingStore();
  const firstName = state.firstName.trim() || "Emma";
  const businessName = state.businessName.trim() || "Salon Soho";
  const baseAddress = state.baseAddress.trim() || "35 Luke Street";
  const publicArea = state.publicArea.trim() || "Shoreditch";
  const exactAddressMeta = state.hideFullAddressUntilBooking
    ? "Exact address hidden until booking"
    : baseAddress;
  const travelMeta =
    state.travelRadius || state.travelFee
      ? `${state.travelRadius || "8"} mi radius · £${state.travelFee || "5"} fee`
      : "Client address";
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const locations = [
    { label: publicArea, meta: exactAddressMeta, active: true },
    { label: businessName, meta: baseAddress, active: false },
    { label: "Mobile appointments", meta: travelMeta, active: false },
    { label: "Add another location", meta: "Set up later", active: false },
  ];

  return (
    <MobileFrame>
      <div className="flex h-full flex-col bg-[#F9F3ED] text-[#1C1814]">
        <StatusBar />
        <header className="relative flex h-[56px] shrink-0 items-center justify-between px-4">
          <div>
            <button
              type="button"
              aria-label="Choose business location"
              aria-expanded={locationMenuOpen}
              onClick={() => setLocationMenuOpen((open) => !open)}
              className="flex h-8 items-center gap-2 rounded-xl border border-[#1C1814] bg-transparent px-3 text-[12px] font-bold tracking-[-0.02em] transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <MapPin size={13} />
              {publicArea}
              <ChevronDown className={locationMenuOpen ? "rotate-180 transition" : "transition"} size={13} />
            </button>
            {locationMenuOpen ? (
              <div className="absolute left-4 top-12 z-30 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_16px_40px_rgba(28,24,20,0.16)]">
                {locations.map((location) => (
                  <button
                    key={location.label}
                    type="button"
                    onClick={() => setLocationMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#FFF7F2]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F0EA] text-[#1C1814]">
                      <MapPin size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold text-[#1C1814]">{location.label}</span>
                      <span className="block truncate text-[11px] text-[#8B8884]">{location.meta}</span>
                    </span>
                    {location.active ? <Check size={14} className="text-[#FF520D]" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <Bell size={19} />
              <span className="absolute -right-1 top-0 h-2 w-2 rounded-full bg-[#FB2C36]" />
            </button>
            <button
              type="button"
              aria-label="Open setup hub"
              onClick={() => router.push("/setup-hub")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1814] text-white focus:outline-none focus:ring-2 focus:ring-[#111]"
            >
              <Users size={18} />
            </button>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
          <p className="text-[12px] font-bold leading-4 text-[#A4A3A1]">Wednesday 4 March</p>
          <h1 className="mt-3 text-[24px] font-bold leading-8 tracking-[-0.01em] text-[#1C1814]">
            Good afternoon, {firstName}
          </h1>
          <div className="mt-3 flex items-center gap-1 text-[12px] leading-4 text-[#A4A3A1]">
            <ClockGlyph />
            09:00 - 17:00
          </div>

          <div className="mt-4 flex rounded-2xl border border-black/5 bg-white py-4 shadow-[0_8px_20px_rgba(28,24,20,0.04)]">
            <MiniMetric label="Appointments" value="9" />
            <MiniMetric label="Next gap" value="12:30" />
            <MiniMetric label="Booked" value="70%" />
          </div>

          <div className="mt-10 rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(28,24,20,0.05)]">
            <p className="text-[12px] font-bold leading-4 text-[#99A1AF]">Account set up</p>
            <div className="mt-4">
              {[
                ["add services", "Set up the treatments and prices you offer", true],
                ["set up payments", "Connect a payment method to take deposits and card payments", true],
                ["invite team members", "Add your staff members and set their working hours", false],
                ["Set your availability", "Add your working hours so clients can book online", false],
              ].map(([title, body, active], index) => (
                <button
                  key={title as string}
                  type="button"
                  onClick={() => router.push("/setup/services")}
                  className="relative flex w-full gap-3 pb-4 text-left last:pb-0 focus:outline-none focus:ring-2 focus:ring-[#111]"
                >
                  <span className="flex w-4 flex-col items-center">
                    <span
                      className={[
                        "mt-1 h-4 w-4 rounded-full",
                        active ? "bg-[#FF520D]" : "bg-[#E5E7EB] ring-1 ring-[#111]",
                      ].join(" ")}
                    />
                    {index < 3 ? (
                      <span
                        className={[
                          "h-full w-px",
                          active ? "bg-[#FF520D]" : "bg-[#E5E7EB]",
                        ].join(" ")}
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold leading-5 text-[#364153]">
                      {index + 1}. {title}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[#99A1AF]">
                      {body}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#111] text-[13px] font-medium"
              >
                <CreditCard size={16} />
                Import Data
              </button>
              <button
                type="button"
                onClick={() => router.push("/setup-hub")}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#FF520D] text-[13px] font-medium text-white"
              >
                <Store size={16} />
                Continue set up
              </button>
            </div>
          </div>
        </section>

        <nav className="grid h-20 shrink-0 grid-cols-5 border-t border-black/5 bg-white px-2 pt-2">
          {[
            ["Home", Home],
            ["Schedule", CalendarDays],
            ["Clients", Users],
            ["Message", MessageCircle],
            ["Add", PlusGlyph],
          ].map(([label, Icon]) => {
            const ActiveIcon = Icon as typeof Home;
            return (
              <button
                key={label as string}
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold text-[#1C1814] focus:outline-none focus:ring-2 focus:ring-[#111]"
              >
                <ActiveIcon size={21} />
                {label as string}
              </button>
            );
          })}
        </nav>
      </div>
    </MobileFrame>
  );
}
