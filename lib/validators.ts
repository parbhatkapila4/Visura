import { z } from 'zod';

export const CreateSessionSchema = z.object({
  pdfStoreId: z.string().uuid('Invalid PDF Store ID format'),
  sessionName: z.string()
    .min(1, 'Session name is required')
    .max(100, 'Session name too long (max 100 characters)'),
});

export const SendMessageSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long (max 5000 characters)'),
});

export const GetMessagesSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
});

export const DeleteSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
});

export const CreateSummarySchema = z.object({
  summary: z.string()
    .min(10, 'Summary too short')
    .max(50000, 'Summary too long'),
  fileUrl: z.string().url('Invalid file URL').optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name too long'),
});

export const GetSummarySchema = z.object({
  id: z.string().uuid('Invalid summary ID'),
});

export const DeleteSummarySchema = z.object({
  id: z.string().uuid('Invalid summary ID'),
});

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(1, 'Name is required').max(100),
  clerkId: z.string().min(1, 'Clerk ID is required'),
});

export const UpdateUserPlanSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  customerId: z.string().optional(),
});

export const CreateCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email'),
});

export const StripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.record(z.any()),
  }),
});

export const FileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 52428800, 'File too large (max 50MB)')
    .refine(
      (file) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
      'Invalid file type (PDF or DOCX only)'
    ),
});

export const FileMetadataSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().min(1).max(52428800),
  fileType: z.enum(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
});

export const InitializeChatbotSchema = z.object({
  summaryId: z.string().uuid('Invalid summary ID'),
  fullTextContent: z.string()
    .min(50, 'Text content too short for chatbot')
    .max(500000, 'Text content too long'),
  fileName: z.string().min(1).max(255),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query required').max(200),
  filters: z.record(z.string()).optional(),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateSummaryInput = z.infer<typeof CreateSummarySchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateCheckoutInput = z.infer<typeof CreateCheckoutSchema>;
export type FileMetadata = z.infer<typeof FileMetadataSchema>;
export type InitializeChatbotInput = z.infer<typeof InitializeChatbotSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type SearchParams = z.infer<typeof SearchSchema>;

export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Validation failed${context ? ` for ${context}` : ''}: ${errors}`);
  }
  
  return result.data;
}

export function validateSafely<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errors };
  }
  
  return { success: true, data: result.data };
}

