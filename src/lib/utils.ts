import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined
): string {
  if (!error) return "";

  let errorMessage = "An unexpected error occurred. Please try again.";

  // Handle SerializedError
  if ("message" in error && error.message) {
    return error.message;
  }

  // Handle FetchBaseQueryError
  const fetchError = error as FetchBaseQueryError;

  // Handle different error types
  if (fetchError.status === 400) {
    // Bad Request - validation errors
    if (
      fetchError.data &&
      typeof fetchError.data === "object" &&
      "message" in fetchError.data
    ) {
      errorMessage = (fetchError.data as { message: string }).message;
    } else if (
      fetchError.data &&
      typeof fetchError.data === "object" &&
      "errors" in fetchError.data
    ) {
      // Handle validation errors array
      const errors = (fetchError.data as { errors: string[] }).errors;
      errorMessage = errors.join(", ");
    }
  } else if (fetchError.status === 401) {
    // Unauthorized
    errorMessage = "Your session has expired. Please sign in again.";
  } else if (fetchError.status === 403) {
    // Forbidden
    errorMessage = "You don't have permission to perform this action.";
  } else if (fetchError.status === 404) {
    // Not Found
    errorMessage = "The requested resource was not found.";
  } else if (fetchError.status === 409) {
    // Conflict
    errorMessage = "This action conflicts with existing data.";
  } else if (fetchError.status === 422) {
    // Unprocessable Entity - validation errors
    if (
      fetchError.data &&
      typeof fetchError.data === "object" &&
      "message" in fetchError.data
    ) {
      errorMessage = (fetchError.data as { message: string }).message;
    }
  } else if (fetchError.status === 429) {
    // Too Many Requests
    errorMessage = "Too many requests. Please wait a moment and try again.";
  } else if (fetchError.status === 500) {
    // Internal Server Error
    errorMessage = "Server error. Please try again later.";
  } else if (fetchError.status === "FETCH_ERROR") {
    // Network error
    errorMessage = "Network error. Please check your connection and try again.";
  } else if (fetchError.status === "PARSING_ERROR") {
    // JSON parsing error
    errorMessage = "Server response error. Please try again.";
  }

  return errorMessage;
}
