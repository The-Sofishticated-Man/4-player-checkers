// Generate unique room ID
export function generateRoomId() {
  return Math.random().toString(36).substring(2, 9).toUpperCase(); // e.g., "A7B2K9X"
}

// Generate unique player ID
export function generatePlayerId() {
  return Math.random().toString(36).substring(2, 15); // e.g., "a7b2k9x1m"
}
