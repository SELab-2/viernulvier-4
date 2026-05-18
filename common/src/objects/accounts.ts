import { z } from "zod";

// Base Account object
export const AccountSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  superAdmin: z.boolean(),
});

// Updating & Creating
export const CreateAccountSchema = AccountSchema.omit({
  id: true,
});
export const LoginSchema = AccountSchema.pick({
  username: true,
  password: true,
});
export const UpdateAccountSchema = AccountSchema.partial();
export const ChangePasswordSchema = z.object({
  password: z.string().min(8),
});

// Public Account object.
export const PublicAccountSchema = AccountSchema.omit({
  password: true,
}); // don't leak these. (note: still contains your id so you can still get your api key through that.)

// Type exports.
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type LoginAccount = z.infer<typeof LoginSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type PublicAccount = z.infer<typeof PublicAccountSchema>;
export type Account = z.infer<typeof AccountSchema>;
