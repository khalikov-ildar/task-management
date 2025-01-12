export function sliceUuid(uuid: string): string {
  return uuid.slice(0, 4) + '...'
}
