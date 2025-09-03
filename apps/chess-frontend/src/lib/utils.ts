import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const BASE_URL="https://chess_http.developermatch.me/api"
export const WS_URL="ws://chess_ws.developermatch.me/"



