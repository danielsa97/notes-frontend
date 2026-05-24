import { supabase } from "@/modules/auth/data/services/supabaseClient";
import type { Hotel } from "@/core/utils/types";

const HOTEL_IMAGES_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "Files";

type CreateHotelPayload = Omit<
  Hotel,
  "id" | "created_at" | "updated_at" | "image_urls"
>;

async function uploadHotelImages(ownerId: string, imageFiles: File[]) {
  const uploadedPaths: string[] = [];

  try {
    for (const file of imageFiles) {
      const sanitizedName = file.name.replace(/\s+/g, "-").toLowerCase();
      const filePath = `hotels/${ownerId}/${crypto.randomUUID()}-${sanitizedName}`;

      const { error } = await supabase.storage
        .from(HOTEL_IMAGES_BUCKET)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      uploadedPaths.push(filePath);
    }

    return uploadedPaths.map((filePath) => {
      const { data } = supabase.storage
        .from(HOTEL_IMAGES_BUCKET)
        .getPublicUrl(filePath);
      return data.publicUrl;
    });
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(HOTEL_IMAGES_BUCKET).remove(uploadedPaths);
    }
    throw error;
  }
}

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

  async createHotel(hotel: CreateHotelPayload, imageFiles: File[] = []) {
    if (imageFiles.length > 3) {
      throw new Error("Você pode enviar no máximo 3 imagens por hotel.");
    }

    const imageUrls =
      imageFiles.length > 0
        ? await uploadHotelImages(hotel.owner_id, imageFiles)
        : [];

    const { data, error } = await supabase
      .from("hotels")
      .insert([{ ...hotel, image_urls: imageUrls }])
      .select();

    if (error && imageUrls.length > 0) {
      const pathsToRemove = imageUrls
        .map((url) => {
          const marker = `/storage/v1/object/public/${HOTEL_IMAGES_BUCKET}/`;
          const index = url.indexOf(marker);
          if (index === -1) return null;
          return url.slice(index + marker.length);
        })
        .filter((path): path is string => Boolean(path));

      if (pathsToRemove.length > 0) {
        await supabase.storage.from(HOTEL_IMAGES_BUCKET).remove(pathsToRemove);
      }
    }

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
