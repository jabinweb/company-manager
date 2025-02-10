import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.enum(['GENERAL', 'PROJECT', 'MAINTENANCE', 'DEVELOPMENT', 'MEETING', 'DOCUMENTATION', 'REVIEW', 'OTHER']),
  assignedToId: z.string(),
  parentTaskId: z.number().optional(), // Changed to number
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

export const updateTaskSchema = z.object({
  id: z.number(), // Changed to number
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  progress: z.number().min(0).max(100).optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

export const taskCommentSchema = z.object({
  content: z.string().min(1),
  taskId: z.number() // Changed to number
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskCommentInput = z.infer<typeof taskCommentSchema>