// User types
export interface User {
  id: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  avatar_url?: string;
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
