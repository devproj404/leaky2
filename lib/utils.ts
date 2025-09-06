import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow as formatDistanceToNowFn } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "PPP")
}

export function formatDistanceToNow(date: string | Date): string {
  return formatDistanceToNowFn(new Date(date), { addSuffix: true })
}
