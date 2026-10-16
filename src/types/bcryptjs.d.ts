declare module 'bcryptjs' {
  export function compare(password: string, hash: string): Promise<boolean>;
}