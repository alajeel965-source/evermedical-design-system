import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: "grid" | "table";
  onViewChange: (view: "grid" | "table") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-medical-sm border border-border bg-card p-1">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="px-3 py-1.5 h-auto"
      >
        <Grid3X3 className="h-4 w-4 mr-1.5" />
        Grid
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="px-3 py-1.5 h-auto"
      >
        <List className="h-4 w-4 mr-1.5" />
        List
      </Button>
    </div>
  );
}