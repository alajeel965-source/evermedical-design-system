import { events } from "../data/events";

const typeStyles: Record<string, string> = {
  Conference: "bg-brand-100 text-brand-700",
  Workshop: "bg-amber-100 text-amber-700",
  Webinar: "bg-emerald-100 text-emerald-700",
};

export default function Events() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="mt-1 text-slate-500">
          Conferences, workshops, and webinars for the medical community.
        </p>
      </div>

      <ul className="space-y-3">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    typeStyles[e.type]
                  }`}
                >
                  {e.type}
                </span>
                <h2 className="font-semibold">{e.title}</h2>
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {new Date(e.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {e.location}
              </div>
            </div>
            <button className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              Register
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
