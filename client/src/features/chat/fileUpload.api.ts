import { api } from "@/lib/api";

export const uploadApi = {
  uploadFile: async (file: File): Promise<{ url: string; name: string; size: number; mimeType: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
};
