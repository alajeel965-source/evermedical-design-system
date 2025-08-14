import { AppShell } from "@/components/shared/AppShell";

export default function Events() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">Events</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Connect with medical professionals at conferences, webinars, and networking events.
          </p>
        </div>
      </div>
    </AppShell>
  );
}