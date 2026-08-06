import { Link } from "react-router-dom";
import { professionals } from "../data/professionals";
import { events } from "../data/events";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 px-8 py-16 text-white">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          The professional network for healthcare
        </h1>
        <p className="mt-4 max-w-xl text-lg text-brand-100">
          Connect with clinicians worldwide, discover events, and grow your
          practice — all in one secure platform.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/network"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Explore the network
          </Link>
          <Link
            to="/events"
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Browse events
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <Stat label="Professionals" value={`${professionals.length}k+`} />
        <Stat label="Specialties" value="40+" />
        <Stat label="Upcoming events" value={`${events.length}`} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="text-3xl font-bold text-brand-700">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
