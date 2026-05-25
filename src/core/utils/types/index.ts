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

export interface TaskRoom {
  task_id: string;
  room_id: string;
  room: { id: string; room_id: string; type: string };
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  image_urls: string[];
  user: { id: string; full_name: string; username: string };
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  due_date?: string | null;
  image_urls: string[];
  is_common_area: boolean;
  completed_at?: string | null;
  hotel_id: string;
  created_by_id: string;
  created_by: { id: string; full_name: string; username: string };
  rooms: TaskRoom[];
  comments?: TaskComment[];
  created_at: string;
  updated_at: string;
}
