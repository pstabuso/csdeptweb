import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["STUDENT", "COORDINATOR", "SECRETARY", "ADMIN"], {
    error: "Choose the role you want to sign in as.",
  }),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must include at least one letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmPassword: z
      .string()
      .min(8, "Confirm your password with at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const concernSchema = z.object({
  subject: z.string().trim().min(5, "Subject must be at least 5 characters."),
  category: z.string().trim().min(3, "Category is required."),
  message: z
    .string()
    .trim()
    .min(15, "Please describe the concern with at least 15 characters."),
});

export const replySchema = z.object({
  message: z.string().trim().min(10, "Reply must be at least 10 characters."),
  status: z.enum(["OPEN", "ANSWERED", "CLOSED"]),
});
