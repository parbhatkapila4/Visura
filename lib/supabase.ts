import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || supabaseUrl.length === 0) {
  throw new Error("Missing or empty NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey || supabaseAnonKey.length === 0) {
  throw new Error("Missing or empty NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP/HTTPS URL");
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL format");
}

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key (first 10 chars):", supabaseAnonKey.substring(0, 10) + "...");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadToSupabase(file: File, userId: string) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        error: "Supabase configuration is missing. Please check your environment variables.",
      };
    }

    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}-${file.name}`;

    console.log("Uploading to Supabase:", fileName);

    const { data, error } = await supabase.storage.from("pdf").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("Upload succeeded but no data returned");
    }

    const { data: urlData } = supabase.storage.from("pdf").getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    };
  } catch (error) {
    console.error("Supabase upload error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = JSON.stringify(error);
    const errorStack = error instanceof Error ? error.stack || "" : "";

    const isNetworkError =
      errorMessage.includes("ERR_NAME_NOT_RESOLVED") ||
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("Network request failed") ||
      errorString.includes("ERR_NAME_NOT_RESOLVED") ||
      errorStack.includes("ERR_NAME_NOT_RESOLVED") ||
      (error as any)?.message?.includes("Failed to fetch") ||
      (error as any)?.cause?.message?.includes("Failed to fetch");

    if (isNetworkError) {
      return {
        success: false,
        error: `Cannot connect to Supabase storage. The URL "${supabaseUrl}" cannot be resolved. Please verify your NEXT_PUBLIC_SUPABASE_URL environment variable is correct and the Supabase project is active.`,
      };
    }

    if (errorMessage.includes("StorageUnknownError") || errorMessage.includes("Unknown")) {
      return {
        success: false,
        error: `Supabase storage error: ${errorMessage}. Please check your NEXT_PUBLIC_SUPABASE_URL and ensure the "pdf" storage bucket exists.`,
      };
    }

    return {
      success: false,
      error: errorMessage || "Upload failed",
    };
  }
}

export async function getFileFromSupabase(path: string) {
  try {
    const { data, error } = await supabase.storage.from("pdf").download(path);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Supabase download error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Download failed",
    };
  }
}
