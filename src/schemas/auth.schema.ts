import z from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must at least contain 8 characters"),
  }),
});

export type RegisterBody = z.infer<typeof registerSchema.shape.body>;

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email or password"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Invalid email or password"),
  }),
});

export type LoginBody = z.infer<typeof loginSchema.shape.body>;
