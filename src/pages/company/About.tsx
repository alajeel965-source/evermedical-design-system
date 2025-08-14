import { AppShell } from "@/components/shared/AppShell";

export default function About() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">About Us</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Learn about EverMedical's mission to transform healthcare technology.
          </p>
        </div>
      </div>
    </AppShell>
  );
}