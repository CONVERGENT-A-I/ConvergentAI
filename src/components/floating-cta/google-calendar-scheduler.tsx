"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock, Loader2, Mail, MessageSquareText, Phone, User, X } from "lucide-react";

interface Slot {
  start: string;
  end: string;
  display: string;
  bookingToken: string;
}

interface SchedulerProps {
  open: boolean;
  zipCode: string;
  roomName: string;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  queueName?: string;
  queueNumber?: string;
  onClose: () => void;
}

function backendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://lab-be.convergentai.tech");
}

function dateInputValue(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function GoogleCalendarScheduler({
  open,
  zipCode,
  roomName,
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  queueName,
  queueNumber,
  onClose,
}: SchedulerProps) {
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const initialDate = useMemo(() => dateInputValue(new Date(Date.now() + 86_400_000), timeZone), [timeZone]);
  const maximumDate = useMemo(() => dateInputValue(new Date(Date.now() + 20 * 86_400_000), timeZone), [timeZone]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    number: string;
    start: string;
    meetLink?: string | null;
    hostInvitationIncluded: boolean;
    hostEmail?: string | null;
    hostIsEventCreator: boolean;
  } | null>(null);

  const loadSlots = async (date = selectedDate) => {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const response = await fetch(
        `${backendUrl()}/api/scheduling/slots?zip=${encodeURIComponent(zipCode)}&timeZone=${encodeURIComponent(timeZone)}&date=${encodeURIComponent(date)}&days=21`,
        { cache: "no-store" },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "calendar_unavailable");
      setSlots(Array.isArray(data.slots) ? data.slots : []);
      if (!data.slots?.length) setError("No meeting times are available on this date. Please choose another date.");
    } catch {
      setError("We couldn't load the calendar right now. Please continue with Ailana to request a callback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setConfirmation(null);
    setName(initialName);
    setEmail(initialEmail);
    setPhone(initialPhone);
    setNotes("");
    setSelectedDate(initialDate);
    setConsent(false);
    void loadSlots(initialDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, zipCode]);

  if (!open) return null;

  const book = async () => {
    if (!selected || name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email.trim()) || !consent) {
      setError("Select a time, provide your name and email, and confirm your consent.");
      return;
    }
    setBooking(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl()}/api/scheduling/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingToken: selected.bookingToken,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
          customerNotes: notes.trim() || undefined,
          customerTimeZone: timeZone,
          zipCode,
          roomName: roomName || undefined,
          consent: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 409) {
        await loadSlots();
        throw new Error("That time was just booked. Please select another available time.");
      }
      if (!response.ok) throw new Error("We couldn't create the appointment. Please try again.");
      setConfirmation({
        number: data.confirmationNumber,
        start: data.start,
        meetLink: data.meetLink,
        hostInvitationIncluded: Boolean(data.hostInvitationIncluded),
        hostEmail: data.hostEmail,
        hostIsEventCreator: Boolean(data.hostIsEventCreator),
      });
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "We couldn't create the appointment.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[260] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-5">
      <div className="relative w-full max-w-2xl max-h-[88dvh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0A0D18] p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,180,216,0.18)]">
        <button aria-label="Close scheduler" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer">
          <X className="h-5 w-5" />
        </button>

        {confirmation ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Meeting Scheduled</h3>
            <p className="mt-3 text-sm text-gray-300">
              Your Calendar invitation was sent to <span className="font-semibold text-white">{email}</span>.
              {confirmation.hostInvitationIncluded && !confirmation.hostIsEventCreator
                ? <> A separate RSVP invitation was also sent to <span className="font-semibold text-white">{confirmation.hostEmail}</span> for review.</>
                : <> The Loan Officer RSVP notification requires a separate scheduler account configuration.</>}
            </p>
            <div className="mx-auto mt-5 max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Confirmation number</p>
              <p className="mt-1 font-mono text-lg font-bold text-[#00b4d8]">{confirmation.number}</p>
              <p className="mt-3 text-sm text-white">
                {new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone }).format(new Date(confirmation.start))}
              </p>
              <p className="mt-1 text-xs text-gray-400">{timeZone}</p>
            </div>
            <button onClick={onClose} className="mt-6 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0757ad] px-6 py-3 text-sm font-bold text-white cursor-pointer">
              Continue with Ailana
            </button>
          </div>
        ) : (
          <>
            <div className="pr-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00b4d8]/10 ring-1 ring-[#00b4d8]/25">
                  <CalendarDays className="h-5 w-5 text-[#00b4d8]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Schedule a Loan Officer Meeting</h3>
                  <p className="text-xs text-gray-400">
                    Scheduling for {queueName ? queueName.replaceAll("_", " ") : "your assigned Loan Officer queue"}
                    {queueNumber ? ` (${queueNumber})` : ""} · ZIP {zipCode}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-300">Choose an available time below. Times are shown in your local time zone: <span className="text-white">{timeZone}</span>.</p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400" htmlFor="meeting-date">Choose a date</label>
              <div className="mb-4 max-w-xs">
                <input
                  id="meeting-date"
                  type="date"
                  value={selectedDate}
                  min={dateInputValue(new Date(), timeZone)}
                  max={maximumDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedDate(value);
                    if (value) void loadSlots(value);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] focus:border-[#00b4d8]"
                />
              </div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Available times</label>
                <button onClick={() => void loadSlots()} disabled={loading} className="text-xs font-semibold text-[#00b4d8] disabled:opacity-50 cursor-pointer">Refresh</button>
              </div>
              {loading ? (
                <div className="flex h-28 items-center justify-center rounded-2xl border border-white/10 bg-white/5"><Loader2 className="h-6 w-6 animate-spin text-[#00b4d8]" /></div>
              ) : (
                <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {slots.map((slot) => (
                    <button key={slot.bookingToken} onClick={() => { setSelected(slot); setError(null); }} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs transition cursor-pointer ${selected?.bookingToken === slot.bookingToken ? "border-[#00b4d8] bg-[#00b4d8]/15 text-white" : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25"}`}>
                      <Clock className="h-4 w-4 shrink-0 text-[#00b4d8]" />{slot.display}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#00b4d8]" /></label>
              <label className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" autoComplete="email" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#00b4d8]" /></label>
              <label className="relative sm:col-span-2"><Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (optional)" type="tel" autoComplete="tel" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#00b4d8]" /></label>
              <label className="relative sm:col-span-2">
                <MessageSquareText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value.slice(0, 2000))}
                  placeholder="How can we help? Describe what you would like to discuss (optional)"
                  rows={3}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#00b4d8]"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-gray-600">{notes.length}/2000</span>
              </label>
            </div>

            <label className="mt-4 flex items-start gap-3 text-xs leading-relaxed text-gray-400 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#00b4d8]" />
              I consent to being contacted about this appointment and to receiving a Google Calendar invitation at the email address provided.
            </label>

            {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={onClose} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5 cursor-pointer">Continue with Ailana</button>
              <button onClick={() => void book()} disabled={booking || loading || !selected} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0757ad] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer">
                {booking && <Loader2 className="h-4 w-4 animate-spin" />}Confirm Meeting
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
