"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetch(`/api/reservations/${id}`).then(r => r.json()).then(data => {
      setReservation(data);
      const secs = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(secs);
    });
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  async function confirm() {
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: "POST" });
    if (res.status === 410) {
      setMsg("Reservation expired.");
      setReservation((r: any) => ({ ...r, status: "RELEASED" }));
      return;
    }
    const data = await res.json();
    setReservation(data);
    setMsg("Purchase confirmed!");
  }

  async function cancel() {
    const res = await fetch(`/api/reservations/${id}/release`, { method: "POST" });
    const data = await res.json();
    setReservation(data);
    setMsg("Cancelled.");
  }

  if (!reservation) return <p className="p-6">Loading...</p>;

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="p-6 max-w-md mx-auto">
      <button onClick={() => router.push("/")} className="text-blue-500 text-sm mb-4">← back</button>
      <h1 className="text-xl font-bold mb-4">Checkout</h1>

      <div className="border rounded p-4 space-y-2 mb-4">
        <p><b>Product:</b> {reservation.product?.name}</p>
        <p><b>Warehouse:</b> {reservation.warehouse?.name}</p>
        <p><b>Qty:</b> {reservation.quantity}</p>
        <p><b>Status:</b> {reservation.status}</p>
      </div>

      {reservation.status === "PENDING" && timeLeft > 0 && (
        <p className="text-lg font-mono mb-4">Time left: {mins}:{secs}</p>
      )}

      {reservation.status === "PENDING" && timeLeft > 0 && (
        <div className="flex gap-2">
          <button onClick={confirm} className="bg-green-600 text-white px-4 py-2 rounded">
            Confirm
          </button>
          <button onClick={cancel} className="border px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      )}

      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
