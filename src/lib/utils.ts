import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeImage(url: string | null | undefined, width = 800, quality = 75): string {
  const FALLBACK = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80";
  if (!url) return FALLBACK;
  if (!url.includes("supabase") && !url.includes("storage")) return url;
  if (url.includes("width=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}width=${width}&quality=${quality}`;
}
