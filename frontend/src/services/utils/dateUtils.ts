
import { format, formatDistance, formatRelative, subDays } from "date-fns";

// Helper function for formatting relative time
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date for formatRelativeTime:", dateString);
      return "Unknown date";
    }
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Format differently based on how long ago it was
    if (diffInDays === 0) {
      // For today, check if it's within the last hour
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        // Within the last hour
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
      }
      
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      // Use a standard date format for older dates
      return format(date, "dd/MM/yyyy");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown date";
  }
}

// Format a date for display as "Month Year"
export function formatMonthYear(dateString: string | null): string {
  if (!dateString) return "Unknown";
  
  try {
    console.log("Formatting date string:", dateString);
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date detected:", dateString);
      return "Unknown";
    }
    
    const formattedDate = format(date, "MMMM yyyy");
    console.log("Formatted date:", formattedDate);
    return formattedDate;
  } catch (error) {
    console.error("Error formatting month/year:", error, "for input:", dateString);
    return "Unknown";
  }
}

// Add a new function to ensure we have a valid date
export function ensureValidDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  
  try {
    console.log("Validating date string:", dateString);
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date detected during validation:", dateString);
      return null;
    }
    
    return dateString;
  } catch (error) {
    console.error("Error validating date:", error, "for input:", dateString);
    return null;
  }
}

// Add a new function to get current date in ISO format for new profiles
export function getCurrentDateISO(): string {
  const currentDate = new Date().toISOString();
  console.log("Generated current ISO date:", currentDate);
  return currentDate;
}

// Format a date in DD/MM/YYYY format
export function formatDateDDMMYYYY(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date for formatDateDDMMYYYY:", dateString);
      return "Unknown";
    }
    
    return format(date, "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
}
