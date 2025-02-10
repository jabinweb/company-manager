
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    employeeId: string
    name: string
    email: string
    image?: string | null
    role: string
  }

  interface Session {
    user: User
  }
}