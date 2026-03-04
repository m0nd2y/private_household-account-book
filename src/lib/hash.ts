export function validateHash(hash: string): boolean {
  return hash === process.env.SECRET_HASH
}
