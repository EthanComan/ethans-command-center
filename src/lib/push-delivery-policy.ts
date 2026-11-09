export function shouldCompletePush(results: boolean[]): boolean {
  return results.some(Boolean);
}

export function isExpiredPushStatus(status: number): boolean {
  return status === 404 || status === 410;
}