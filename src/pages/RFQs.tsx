import { AppShell } from "@/components/shared/AppShell";

export default function RFQs() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">Live RFQs</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Submit and respond to Request for Quotations in real-time.
          </p>
        </div>
      </div>
    </AppShell>
  );
}