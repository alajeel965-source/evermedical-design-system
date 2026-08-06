export interface Professional {
  id: string;
  name: string;
  specialty: string;
  location: string;
  connections: number;
}

export const professionals: Professional[] = [
  { id: "1", name: "Dr. Sara Al-Fulan", specialty: "Cardiology", location: "Kuwait City", connections: 342 },
  { id: "2", name: "Dr. Omar Haddad", specialty: "Neurology", location: "Dubai", connections: 289 },
  { id: "3", name: "Dr. Layla Mansour", specialty: "Pediatrics", location: "Riyadh", connections: 415 },
  { id: "4", name: "Dr. Yousef Karim", specialty: "Orthopedics", location: "Doha", connections: 198 },
  { id: "5", name: "Dr. Nadia Saleh", specialty: "Oncology", location: "Manama", connections: 267 },
  { id: "6", name: "Dr. Hassan Reda", specialty: "Radiology", location: "Muscat", connections: 176 },
];
