// Global helper to imperatively open the floating chat from any component
let globalOpenChat: ((userId: string, userName?: string) => void) | null = null;

export function registerChatOpener(
  fn: (userId: string, userName?: string) => void,
) {
  globalOpenChat = fn;
  return () => {
    globalOpenChat = null;
  };
}

export function openChatWithUser(userId: string, userName?: string) {
  if (globalOpenChat) {
    globalOpenChat(userId, userName);
  }
}
