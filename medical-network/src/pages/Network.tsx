import { useState } from "react";
import { professionals } from "../data/professionals";

export default function Network() {
  const [query, setQuery] = useState("");

  const filtered = professionals.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.specialty.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network</h1>
        <p className="mt-1 text-slate-500">
          Discover and connect with medical professionals.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, specialty, or location…"
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                {p.name
                  .split(" ")
                  .slice(-1)[0]
                  .charAt(0)}
              </span>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-brand-700">{p.specialty}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>{p.location}</span>
              <span>{p.connections} connections</span>
            </div>
            <button className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Connect
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-400">No professionals found.</p>
      )}
    </div>
  );
}
