"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  async function reserve(productId: string, warehouseId: string) {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    });

    if (res.status === 409) {
      setError("Not enough stock available.");
      return;
    }
    if (!res.ok) {
      setError("Something went wrong.");
      return;
    }

    const data = await res.json();
    router.push(`/checkout/${data.id}`);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4">
            <div className="flex justify-between">
              <h2 className="font-semibold">{p.name}</h2>
              <span>₹{p.price}</span>
            </div>
            <div className="mt-2 space-y-1">
              {p.stock.map((s: any) => (
                <div key={s.warehouseId} className="flex justify-between items-center text-sm">
                  <span>{s.warehouseName} — {s.available} available</span>
                  <button
                    disabled={s.available === 0}
                    onClick={() => reserve(p.id, s.warehouseId)}
                    className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-40"
                  >
                    Reserve
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
