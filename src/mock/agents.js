import {
  Users,
  Truck,
  Home,
  FileText,
  DollarSign,
} from "lucide-react";

export const agents = [
  {
    id: "coordinator",
    name: "Move Coordinator",
    icon: Users,
    color: "bg-blue-500",
    status: "active",
  },
  {
    id: "logistics",
    name: "Logistics Agent",
    icon: Truck,
    color: "bg-green-500",
    status: "active",
  },
  {
    id: "housing",
    name: "Housing Agent",
    icon: Home,
    color: "bg-purple-500",
    status: "active",
  },
  {
    id: "legal",
    name: "Legal Agent",
    icon: FileText,
    color: "bg-orange-500",
    status: "busy",
  },
  {
    id: "finance",
    name: "Finance Agent",
    icon: DollarSign,
    color: "bg-red-500",
    status: "idle",
  },
];