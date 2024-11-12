/**
 * Zod Schema for User & LoginUser
 */

import { z } from "zod";

export enum UserRole {
  AGENT = 'agent',
  PASSENGER = 'passenger'
}

const UserRoleEnum = z.enum([UserRole.AGENT, UserRole.PASSENGER]);

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: UserRoleEnum.default(UserRole.PASSENGER),
});

export const LoginUserSchema = UserSchema.pick({ 
  email: true, 
  password: true 
});
 
export type User = z.infer<typeof UserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
