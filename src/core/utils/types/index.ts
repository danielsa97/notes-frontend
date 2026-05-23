// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Hotel types
export interface Hotel {
  id: string;
  name: string;
  description?: string;
  status: "ativo" | "inativo";
  archived: boolean;
  owner_id: string;
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
