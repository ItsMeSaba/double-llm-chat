export function formatMessageTime(date: Date | string) {
  const _date = date instanceof Date ? date : new Date(date);

  return _date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
