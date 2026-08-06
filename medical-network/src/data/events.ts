export interface MedEvent {
  id: string;
  title: string;
  type: "Conference" | "Workshop" | "Webinar";
  date: string;
  location: string;
}

export const events: MedEvent[] = [
  { id: "1", title: "Gulf Cardiology Summit 2026", type: "Conference", date: "2026-09-14", location: "Kuwait City" },
  { id: "2", title: "Advances in Neuroimaging", type: "Workshop", date: "2026-10-02", location: "Dubai" },
  { id: "3", title: "Pediatric Emergency Care", type: "Webinar", date: "2026-10-20", location: "Online" },
  { id: "4", title: "Orthopedic Surgery Techniques", type: "Workshop", date: "2026-11-05", location: "Doha" },
];
