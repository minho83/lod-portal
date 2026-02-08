export const isServer = typeof window === "undefined"

export function safeLocalStorageGet(
  key: string,
  defaultValue: string = "",
): string {
  if (isServer) return defaultValue
  return localStorage.getItem(key) || defaultValue
}
