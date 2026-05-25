// User types
export interface User {
  id: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  status: "ENABLED" | "DISABLED" | "DELETED";
  avatar_url?: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  hotel_memberships?: Array<{
    hotel_id: string;
    role: "owner" | "collaborator";
  }>;
}

// Hotel types
export interface Hotel {
  id: string;
  name: string;
  description?: string | null;
  status: "ENABLED" | "DISABLED" | "ARCHIVED";
  image_urls?: string[];
  my_role?: "owner" | "collaborator";
  pending_transfer?: {
    id: string;
    expires_at: string;
    to_user: { username: string; full_name: string };
  } | null;
  created_at: string;
  updated_at: string;
}

// Ownership transfer types
export interface OwnershipTransfer {
  id: string;
  hotel_id: string;
  from_user_id: string;
  to_user_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  expires_at: string;
  hotel: { id: string; name: string; image_urls: string[] };
  from_user: { id: string; username: string; full_name: string };
  created_at: string;
  updated_at: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  full_name: string;
}

// Rooms types
export interface Room {
  id: string;
  room_id: string;
  type: "CONFORT" | "STANDARD" | "OUTRO";
  description?: string | null;
  status: "ENABLED" | "DISABLED";
  image_urls?: string[];
  hotel_id: string;
  created_at: string;
  updated_at: string;
}

// Activity/Task types
export interface Activity {
  id: string;
  title: string;
  description?: string;
  status: "pendente" | "em_andamento" | "concluida";
  hotel_id: string;
  user_id: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Tasks module types
export type TaskStatus =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "CANCELADA";
export type TaskType = "ROTINEIRA" | "ESPORADICA" | "MANUTENCAO";
export type TaskFrequency = "DIARIA" | "UNICA";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  type: TaskType;
  frequency: TaskFrequency;
  starts_on?: string | null;
  ends_on?: string | null;
  due_date?: string | null;
  image_urls: string[];
  is_common_area: boolean;
  hotel_id: string;
  created_by_id: string;
  created_by: { id: string; full_name: string; username: string };
  created_at: string;
  updated_at: string;
}

export interface TaskRunItem {
  id: string;
  task_run_id: string;
  room_id: string;
  status: TaskStatus;
  execution_note?: string | null;
  execution_image_urls: string[];
  completed_at?: string | null;
  room: { id: string; room_id: string; type: string };
  updated_by?: { id: string; full_name: string; username: string } | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRun {
  id: string;
  task_id: string;
  hotel_id: string;
  run_date: string;
  status: TaskStatus;
  completed_at?: string | null;
  task: Task;
  items: TaskRunItem[];
  created_at: string;
  updated_at: string;
}

export interface DailyTaskOverview {
  date: string;
  totalRuns: number;
  byStatus: Record<TaskStatus, number>;
  totalItemsPending: number;
  roomsWithPending: Array<{ roomId: string; pendingCount: number }>;
}

export interface TaskHistoryDay {
  date: string;
  total: number;
  pendente: number;
  emAndamento: number;
  concluida: number;
  cancelada: number;
}

export interface TaskHistoryPeriod {
  from: string;
  to: string;
  totalRuns: number;
  byDay: TaskHistoryDay[];
}

export interface RecurringRoomIssue {
  roomId: string;
  occurrences: number;
  latestDate: string;
  examples: string[];
}

export interface RecurringRoomIssuesResponse {
  periodDays: number;
  minOccurrences: number;
  recurringRooms: RecurringRoomIssue[];
}
