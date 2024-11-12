/**
 * Zod Schema for User
 */

import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

export type User = z.infer<typeof UserSchema>;
