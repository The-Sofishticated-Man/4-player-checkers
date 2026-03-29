// Generate unique ID
export function generateID() {
  return Math.random().toString(36).substring(2, 9).toUpperCase(); // e.g., "A7B2K9X"
}
