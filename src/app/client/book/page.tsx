"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  Car,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import {
  SERVICES as FALLBACK_SERVICES,
  type Service,
} from "@/lib/mock-data";

const PRESET_VEHICLES = [
  {
    make: "Honda",
    model: "Civic Oriel",
    plate_number: "LEE-4821",
  },
  {
    make: "Toyota",
    model: "Corolla Altis 1.6",
    plate_number: "LHE-1190",
  },
];

function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("service");
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const [services, setServices] = useState<Service[]>([]);

  // Flow state: 1 | 2 | 3 | 4 (4 = success confirmed)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Editable Vehicle inputs
  const [vehicleMake, setVehicleMake] = useState("Honda");
  const [vehicleModel, setVehicleModel] = useState("Civic Oriel");
  const [vehiclePlate, setVehiclePlate] = useState("LEE-4821");

  // Tomorrow's date default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [bookingDate, setBookingDate] = useState(defaultDateStr);
  const [bookingTime, setBookingTime] = useState("10:30");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Session check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/client/login");
      }
    });
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    async function loadServices() {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, name, description, price_min, price_max, active")
          .eq("active", true)
          .order("name", { ascending: true });

        const list: Service[] =
          data && !error && data.length > 0
            ? data.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price_min: Number(item.price_min),
                price_max: Number(item.price_max),
                active: item.active,
              }))
            : FALLBACK_SERVICES.filter((s) => s.active);

        setServices(list);

        if (preselectedServiceId) {
          const found = list.find((s) => s.id === preselectedServiceId);
          if (found) setSelectedService(found);
          else if (list.length > 0) setSelectedService(list[0]);
        } else if (list.length > 0) {
          setSelectedService(list[0]);
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        const fallback = FALLBACK_SERVICES.filter((s) => s.active);
        setServices(fallback);
        if (fallback.length > 0) setSelectedService(fallback[0]);
      }
    }
    loadServices();
  }, [preselectedServiceId]);

  function handleSelectPreset(preset: (typeof PRESET_VEHICLES)[0]) {
    setVehicleMake(preset.make);
    setVehicleModel(preset.model);
    setVehiclePlate(preset.plate_number);
    setBookingError(null);
  }

  async function handleConfirmBooking() {
    if (!selectedService) return;
    const cleanPlate = vehiclePlate.trim().toUpperCase();
    const cleanMake = vehicleMake.trim();
    const cleanModel = vehicleModel.trim();

    if (!cleanPlate || !cleanMake || !cleanModel) {
      setBookingError("Please provide vehicle make, model, and plate number.");
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/client/login");
        return;
      }

      const userId = session.user.id;

      // 1. Check if vehicle already exists for this user
      const { data: existingVehicles, error: vehLookupErr } = await supabase
        .from("vehicles")
        .select("id")
        .eq("user_id", userId)
        .eq("plate_number", cleanPlate)
        .limit(1);

      if (vehLookupErr) {
        console.error("Vehicle lookup error:", vehLookupErr);
      }

      let vehicleId = existingVehicles?.[0]?.id;

      // 2. If not found, insert new vehicle
      if (!vehicleId) {
        const { data: newVeh, error: insertVehErr } = await supabase
          .from("vehicles")
          .insert({
            user_id: userId,
            make: cleanMake,
            model: cleanModel,
            plate_number: cleanPlate,
          })
          .select("id")
          .single();

        if (insertVehErr) {
          console.error("Insert vehicle error:", insertVehErr);
          if (
            insertVehErr.code === "23505" ||
            insertVehErr.message?.toLowerCase().includes("unique") ||
            insertVehErr.message?.toLowerCase().includes("plate_number")
          ) {
            setBookingError(
              "This plate number is already registered to another account — please double check it or use a different vehicle."
            );
            setIsSubmitting(false);
            return;
          }
          setBookingError(insertVehErr.message || "Failed to register vehicle.");
          setIsSubmitting(false);
          return;
        }

        vehicleId = newVeh.id;
      }

      // 3. Insert real booking
      const { data: newBooking, error: bookingErr } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          vehicle_id: vehicleId,
          service_id: selectedService.id,
          date: bookingDate,
          time: bookingTime,
          status: "pending",
        })
        .select("id")
        .single();

      if (bookingErr) {
        console.error("Insert booking error:", bookingErr);
        setBookingError(bookingErr.message || "Failed to create booking.");
        setIsSubmitting(false);
        return;
      }

      setConfirmedBookingId(newBooking.id);
      setIsSubmitting(false);
      setStep(4);
    } catch (err) {
      console.error("Unexpected booking error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setBookingError(msg);
      setIsSubmitting(false);
    }
  }

  const shadow = dark
    ? "0 1px 3px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(20,22,26,0.06)";

  return (
    <main
      className="min-h-screen w-full p-4 sm:p-6 pb-20 relative overflow-x-hidden"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      <div className="max-w-[420px] mx-auto relative z-10 flex flex-col gap-5">
        {/* Top bar */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step > 1 && step < 4) {
                  setStep((s) => (s - 1) as 1 | 2 | 3);
                } else {
                  router.push("/client/home");
                }
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: shadow,
              }}
              aria-label="Go back"
            >
              <ArrowLeft size={16} color="var(--ink)" />
            </button>
            <div>
              <p className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                Online Reservation
              </p>
              <h1
                className="font-oswald text-xl font-semibold leading-tight"
                style={{ color: "var(--ink)" }}
              >
                Book a Service
              </h1>
            </div>
          </div>

          <button
            id="btn-book-theme-toggle"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "var(--card)", boxShadow: shadow }}
          >
            {dark ? (
              <Sun size={15} color="var(--lime)" />
            ) : (
              <Moon size={15} color="var(--ink)" />
            )}
          </button>
        </header>

        {/* Step Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-inter font-semibold" style={{ color: "var(--ink)" }}>
                {step === 1 && "Select Service"}
                {step === 2 && "Vehicle & Schedule"}
                {step === 3 && "Review & Confirm"}
              </span>
              <span className="font-mono text-xs font-semibold" style={{ color: "var(--slate)" }}>
                Step {step} of 3
              </span>
            </div>

            {/* 3 segmented bars */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background:
                      s <= step ? "var(--lime)" : "var(--chip)",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 1: Service Picker ─── */}
        {step === 1 && (
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="font-oswald text-lg font-semibold" style={{ color: "var(--ink)" }}>
                Choose required service
              </h2>
              <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                Select one service for your appointment. Extra requests can be added in notes.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {services.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    type="button"
                    className="w-full text-left rounded-2xl p-4 border transition-all duration-200"
                    style={{
                      background: "var(--card)",
                      borderColor: isSelected ? "var(--lime)" : "var(--border)",
                      borderWidth: isSelected ? "2px" : "1px",
                      boxShadow: shadow,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center border transition-colors"
                          style={{
                            background: isSelected ? "var(--lime)" : "transparent",
                            borderColor: isSelected ? "var(--lime)" : "var(--slate)",
                          }}
                        >
                          {isSelected && <Check size={12} className="stroke-[3] text-black" />}
                        </div>
                        <span className="font-inter text-sm font-semibold" style={{ color: "var(--ink)" }}>
                          {svc.name}
                        </span>
                      </div>

                      <span
                        className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--chip)", color: "var(--ink)" }}
                      >
                        Rs. {svc.price_min.toLocaleString()} – {svc.price_max.toLocaleString()}
                      </span>
                    </div>

                    <p className="font-inter text-xs pl-7" style={{ color: "var(--slate)" }}>
                      {svc.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              id="btn-step1-next"
              type="button"
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
              style={{ background: "var(--lime)", color: "var(--ink-2)" }}
            >
              Continue to Schedule <ChevronRight size={16} />
            </button>
          </section>
        )}

        {/* ─── STEP 2: Vehicle & Date/Time ─── */}
        {step === 2 && (
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="font-oswald text-lg font-semibold" style={{ color: "var(--ink)" }}>
                Vehicle &amp; Appointment Time
              </h2>
              <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                Fill in or customize your vehicle details and select your preferred booking time.
              </p>
            </div>

            {/* Quick-Select Preset Buttons */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_VEHICLES.map((preset) => {
                  const isMatch =
                    vehiclePlate.trim().toUpperCase() === preset.plate_number.toUpperCase();
                  return (
                    <button
                      key={preset.plate_number}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 rounded-2xl border text-left transition-all"
                      style={{
                        background: isMatch ? "var(--chip)" : "var(--card)",
                        borderColor: isMatch ? "var(--lime)" : "var(--border)",
                        borderWidth: isMatch ? "2px" : "1px",
                        boxShadow: shadow,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Car size={14} color="var(--ink)" />
                        <span className="font-inter text-xs font-semibold truncate" style={{ color: "var(--ink)" }}>
                          {preset.make} {preset.model}
                        </span>
                      </div>
                      <span
                        className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: "var(--ink-2)", color: "var(--lime)" }}
                      >
                        {preset.plate_number}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Vehicle Inputs */}
            <div
              className="rounded-2xl p-4 border flex flex-col gap-3"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: shadow,
              }}
            >
              <span className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                Vehicle Details
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="input-vehicle-make" className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                    Make
                  </label>
                  <input
                    id="input-vehicle-make"
                    type="text"
                    required
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="e.g. Honda"
                    className="w-full rounded-xl px-3 py-2 font-inter text-xs border outline-none"
                    style={{
                      background: "var(--chip)",
                      color: "var(--ink)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="input-vehicle-model" className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                    Model
                  </label>
                  <input
                    id="input-vehicle-model"
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Civic Oriel"
                    className="w-full rounded-xl px-3 py-2 font-inter text-xs border outline-none"
                    style={{
                      background: "var(--chip)",
                      color: "var(--ink)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="input-vehicle-plate" className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                  Plate Number
                </label>
                <input
                  id="input-vehicle-plate"
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => {
                    setVehiclePlate(e.target.value.toUpperCase());
                    setBookingError(null);
                  }}
                  placeholder="e.g. LEE-4821"
                  className="w-full rounded-xl px-3 py-2 font-mono text-xs font-semibold border outline-none tracking-wider"
                  style={{
                    background: "var(--chip)",
                    color: "var(--ink)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>
            </div>

            {/* Date & Time Picker */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="booking-date"
                  className="font-inter text-xs font-semibold flex items-center gap-1"
                  style={{ color: "var(--ink)" }}
                >
                  <CalendarIcon size={13} color="var(--slate)" /> Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 font-inter text-xs border outline-none"
                  style={{
                    background: "var(--chip)",
                    color: "var(--ink)",
                    borderColor: "var(--border)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="booking-time"
                  className="font-inter text-xs font-semibold flex items-center gap-1"
                  style={{ color: "var(--ink)" }}
                >
                  <Clock size={13} color="var(--slate)" /> Time Slot
                </label>
                <select
                  id="booking-time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 font-inter text-xs border outline-none"
                  style={{
                    background: "var(--chip)",
                    color: "var(--ink)",
                    borderColor: "var(--border)",
                  }}
                >
                  {["08:30", "09:30", "10:30", "11:30", "13:30", "14:30", "15:30", "16:30"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional notes */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="booking-notes"
                className="font-inter text-xs font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Special Instructions (Optional)
              </label>
              <textarea
                id="booking-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any noise, fluid leak, or specific issue..."
                className="w-full rounded-xl px-3 py-2 font-inter text-xs border outline-none resize-none"
                style={{
                  background: "var(--chip)",
                  color: "var(--ink)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-xl font-inter text-xs font-semibold border transition-all"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                }}
              >
                Back
              </button>
              <button
                id="btn-step2-next"
                type="button"
                disabled={!bookingDate || !bookingTime || !vehiclePlate.trim() || !vehicleMake.trim()}
                onClick={() => {
                  setBookingError(null);
                  setStep(3);
                }}
                className="w-2/3 flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                Review Booking <ChevronRight size={16} />
              </button>
            </div>
          </section>
        )}

        {/* ─── STEP 3: Review & Confirm ─── */}
        {step === 3 && (
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="font-oswald text-lg font-semibold" style={{ color: "var(--ink)" }}>
                Review Reservation Details
              </h2>
              <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                Please check the details below before placing your service appointment.
              </p>
            </div>

            {/* Inline error if any */}
            {bookingError && (
              <div
                className="rounded-xl p-3 flex items-start gap-2.5 border"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  borderColor: "#EF4444",
                  color: "#EF4444",
                }}
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="font-inter text-xs leading-relaxed">{bookingError}</p>
              </div>
            )}

            {/* Summary card */}
            <div
              className="rounded-2xl p-4 border flex flex-col gap-4"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: shadow,
              }}
            >
              {/* Service */}
              <div className="flex items-start justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>
                    Selected Service
                  </span>
                  <p className="font-oswald text-base font-semibold" style={{ color: "var(--ink)" }}>
                    {selectedService?.name}
                  </p>
                  <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                    {selectedService?.description}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold mt-1" style={{ color: "var(--ink)" }}>
                  Rs. {selectedService?.price_min.toLocaleString()} – {selectedService?.price_max.toLocaleString()}
                </span>
              </div>

              {/* Vehicle */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>
                    Vehicle
                  </span>
                  <p className="font-inter text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {vehicleMake} {vehicleModel}
                  </p>
                </div>
                <span
                  className="font-mono text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: "var(--ink-2)", color: "var(--lime)" }}
                >
                  {vehiclePlate.trim().toUpperCase()}
                </span>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>
                    Date
                  </span>
                  <p className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                    {bookingDate}
                  </p>
                </div>
                <div>
                  <span className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>
                    Time Slot
                  </span>
                  <p className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                    {bookingTime}
                  </p>
                </div>
              </div>

              {notes && (
                <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>
                    Notes
                  </span>
                  <p className="font-inter text-xs italic mt-0.5" style={{ color: "var(--slate)" }}>
                    &ldquo;{notes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Note about confirmation */}
            <div
              className="rounded-xl p-3 flex items-start gap-2.5 border"
              style={{ background: "var(--chip)", borderColor: "var(--border)" }}
            >
              <Sparkles size={15} className="shrink-0 mt-0.5" style={{ color: "var(--ink)" }} />
              <p className="font-inter text-[11px] leading-relaxed" style={{ color: "var(--slate)" }}>
                Your service reservation will be recorded instantly in the Allyan Garage workshop schedule.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 rounded-xl font-inter text-xs font-semibold border transition-all"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                }}
              >
                Back
              </button>
              <button
                id="btn-confirm-booking"
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="w-2/3 flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>
          </section>
        )}

        {/* ─── STEP 4: Success State ─── */}
        {step === 4 && (
          <section className="flex flex-col items-center text-center gap-5 pt-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "var(--lime)" }}
            >
              <CheckCircle2 size={36} color="var(--ink-2)" className="stroke-[2.5]" />
            </div>

            <div>
              <span
                className="font-mono text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full inline-block mb-2"
                style={{ background: "var(--chip)", color: "var(--ink)" }}
              >
                Booking ID: #{confirmedBookingId ? confirmedBookingId.slice(0, 8).toUpperCase() : "AG-LIVE"}
              </span>
              <h2
                className="font-oswald text-2xl font-semibold mb-1"
                style={{ color: "var(--ink)" }}
              >
                Booking Confirmed!
              </h2>
              <p className="font-inter text-xs max-w-xs mx-auto" style={{ color: "var(--slate)" }}>
                We have scheduled your <strong>{selectedService?.name}</strong> for{" "}
                <strong>{vehicleMake} {vehicleModel}</strong> on{" "}
                <strong>{bookingDate}</strong> at <strong>{bookingTime}</strong>.
              </p>
            </div>

            <div
              className="w-full rounded-2xl p-4 border text-left flex flex-col gap-2"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: shadow,
              }}
            >
              <p className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                Next Steps:
              </p>
              <ul className="font-inter text-xs space-y-1.5 list-disc pl-4" style={{ color: "var(--slate)" }}>
                <li>Arrive at Allyan Garage 10 minutes prior to your slot.</li>
                <li>Show your plate number <strong>{vehiclePlate.trim().toUpperCase()}</strong> at Bay 1.</li>
                <li>Track live job progress on your mobile portal anytime.</li>
              </ul>
            </div>

            <div className="flex flex-col w-full gap-2.5 mt-2">
              <Link
                id="btn-success-to-status"
                href="/client/status"
                className="w-full py-3.5 rounded-xl font-inter text-sm font-semibold text-center transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                Track Vehicle Status
              </Link>
              <Link
                id="btn-success-to-home"
                href="/client/home"
                className="w-full py-3.5 rounded-xl font-inter text-xs font-semibold text-center border transition-all"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                }}
              >
                Back to Home
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function ClientBookPage() {
  return (
    <Suspense fallback={null}>
      <BookPageContent />
    </Suspense>
  );
}