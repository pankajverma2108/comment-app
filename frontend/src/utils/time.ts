export function isWithin15Minutes(isoTimestamp: string) {
  const now = new Date().getTime();
  const target = new Date(isoTimestamp).getTime();
  const diffMinutes = (now - target) / (1000 * 60);
  return diffMinutes <= 15;
}
