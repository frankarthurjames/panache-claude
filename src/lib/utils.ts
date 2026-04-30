import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeImage(url: string, width = 800): string {
  if (!url) return url;
  if (url.includes("images.unsplash.com")) {
    return `${url.split("?")[0]}?w=${width}&auto=format&fit=crop&q=80`;
  }
  return url;
}
