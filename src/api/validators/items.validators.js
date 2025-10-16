import { z } from 'zod';

export const ListItemsQuery = z.object({
  sector: z.enum(['ayurveda','yoga_naturopathy','unani','siddha','homeopathy']).optional(),
  source: z.string().optional(),
  q: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional()
});
