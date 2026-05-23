import { supabase } from "@/modules/auth/data/services/supabaseClient";
import type { Hotel } from "@/core/utils/types";

export const hotelService = {
  async getHotels() {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  async getHotelById(id: string) {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async createHotel(hotel: Omit<Hotel, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("hotels")
      .insert([hotel])
      .select();
    return { data, error };
  },

  async updateHotel(id: string, updates: Partial<Hotel>) {
    const { data, error } = await supabase
      .from("hotels")
      .update(updates)
      .eq("id", id)
      .select();
    return { data, error };
  },

  async deleteHotel(id: string) {
    const { error } = await supabase.from("hotels").delete().eq("id", id);
    return { error };
  },

  async toggleHotelStatus(id: string, status: "ativo" | "inativo") {
    return this.updateHotel(id, { status });
  },

  async archiveHotel(id: string) {
    return this.updateHotel(id, { archived: true });
  },
};
