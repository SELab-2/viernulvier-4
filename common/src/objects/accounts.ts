import { z } from "zod";

export const AccountSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  superAdmin: z.boolean(),
});

export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  superAdmin: true,
});
export const UpdateAccountSchema = AccountSchema.partial();
export const PublicAccountSchema = AccountSchema.omit({
  password: true,
  superAdmin: true,
}); // don't leak these. (note: still contains your id so you can still get your api key through that.)

export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
export type PublicAccount = z.infer<typeof PublicAccountSchema>;
