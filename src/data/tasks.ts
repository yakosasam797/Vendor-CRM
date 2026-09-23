import type { StatusTone } from "@paryatech/design-system";

export type TaskStatus = "Open" | "In progress" | "Blocked" | "Done";

export interface VendorTask {
  id: string;
  title: string;
  context: string;
  description?: string;
  priority?: "P1" | "P2" | "P3";
  assigneeName: string;
  assigneeRole: string;
  assigneeInitials: string;
  assigneeTone: "pink" | "default";
  due: string;
  status: TaskStatus;
}

export const TASK_STATUS_TONE: Record<TaskStatus, StatusTone> = {
  Open: "open",
  "In progress": "progress",
  Blocked: "blocked",
  Done: "done",
};

export const OPEN_VENDOR_TASKS: VendorTask[] = [
  {
    id: "tsk-1",
    title: "Confirm rate card for 2026–27 season",
    context: "Rate cards · Accommodation tariff",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "Today 4 PM",
    status: "In progress",
  },
  {
    id: "tsk-2",
    title: "Collect signed contract amendment",
    context: "Docs · Commercial",
    assigneeName: "Meera Joseph",
    assigneeRole: "Operations",
    assigneeInitials: "MJ",
    assigneeTone: "default",
    due: "Today 6 PM",
    status: "Open",
  },
  {
    id: "tsk-3",
    title: "Update stop-sale notice window",
    context: "Commercial · Terms",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "13 Aug",
    status: "Open",
  },
  {
    id: "tsk-4",
    title: "Review group allotment request",
    context: "Services · Example Lake Resort",
    assigneeName: "Vrushabh Jain",
    assigneeRole: "Owner",
    assigneeInitials: "VJ",
    assigneeTone: "pink",
    due: "14 Aug",
    status: "Open",
  },
  {
    id: "tsk-5",
    title: "Publish Hill Retreat draft tariff",
    context: "Blocked by missing meal plans",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "—",
    status: "Blocked",
  },
];

export const DONE_VENDOR_TASKS: VendorTask[] = [
  {
    id: "tsk-d1",
    title: "Onboard primary vendor contacts",
    context: "Overview · Contacts",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "10 Aug",
    status: "Done",
  },
  {
    id: "tsk-d2",
    title: "Import base accommodation tariff",
    context: "Rate cards · Example Lake Resort",
    assigneeName: "Meera Joseph",
    assigneeRole: "Operations",
    assigneeInitials: "MJ",
    assigneeTone: "default",
    due: "8 Aug",
    status: "Done",
  },
  {
    id: "tsk-d3",
    title: "Set payment terms to Net 30",
    context: "Commercial · Terms",
    assigneeName: "Vrushabh Jain",
    assigneeRole: "Owner",
    assigneeInitials: "VJ",
    assigneeTone: "pink",
    due: "7 Aug",
    status: "Done",
  },
];
