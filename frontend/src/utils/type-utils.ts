
/**
 * A utility function to safely cast JSON data to a specific type
 * @param data The JSON data to cast
 * @param defaultValue A default value to return if the cast fails
 * @returns The cast data or the default value
 */
export function safeCast<T>(data: any, defaultValue: T): T {
  try {
    if (data === null || data === undefined) {
      return defaultValue;
    }
    
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        return defaultValue;
      }
    }
    
    return data as T;
  } catch {
    return defaultValue;
  }
}
