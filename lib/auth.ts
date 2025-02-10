
export { getServerSession } from './server-session'
export { useSession, signOut } from '@/hooks/use-session'
export { AuthProvider } from '@/contexts/auth-context'

// You can also export auth-related types
export type { Session, User } from '@/types/auth'