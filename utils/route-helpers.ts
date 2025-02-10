export const ROUTES = {
  PUBLIC: ['/', '/login', '/register'],
  SUPER_ADMIN: {
    DEFAULT: '/admin',
    PROTECTED: ['/admin', '/admin/companies', '/admin/approvals']
  },
  ADMIN: {
    DEFAULT: '/dashboard',
    PROTECTED: ['/dashboard', '/dashboard/companies', '/dashboard/employees']
  },
  EMPLOYEE: {
    DEFAULT: '/employee/dashboard',
    AUTH: ['/employee/login', '/employee/register'],
    PROTECTED: ['/employee', '/employee/dashboard', '/employee/profile']
  },
  API: {
    PUBLIC: ['/api/auth', '/api/register', '/api/employee/register', '/api/uploadthing']
  }
} as const

export const getRoleBasedPath = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN': return ROUTES.SUPER_ADMIN.DEFAULT
    case 'ADMIN': return ROUTES.ADMIN.DEFAULT
    case 'EMPLOYEE': return ROUTES.EMPLOYEE.DEFAULT
    default: return '/login'
  }
}
