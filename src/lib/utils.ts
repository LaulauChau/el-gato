import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Failure, Success } from "@/utils/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function ok<T = void>(data: T): Success<T> {
  return { success: true, data };
}

export function err<T = Error>(error: T): Failure<T> {
  return { success: false, error };
}
