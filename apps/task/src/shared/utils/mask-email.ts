export function maskEmail(email: string): string {
  const splitted = email.split('@')
  const lastPreservedChar = splitted[0][splitted[0].length - 1]
  return splitted[0][0] + '*****' + lastPreservedChar + '@' + splitted[1]
}
