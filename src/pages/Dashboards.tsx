import { AppShell } from "@/components/shared/AppShell";

export default function Dashboards() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">Dashboards</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Monitor your medical organization's performance and analytics.
          </p>
        </div>
      </div>
    </AppShell>
  );
}