import { z } from "zod";

import { STUDENT_CONCERN_CATEGORIES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    studentNumber: z
      .string()
      .trim()
      .min(5, "Student number must be at least 5 characters."),
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

export const accessUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  studentNumber: z.string().trim().optional(),
  role: z.enum(["STUDENT", "COORDINATOR", "SECRETARY", "ADMIN"]),
  status: z.enum(["ACTIVE", "DISABLED"]),
});

export const studentProfileSchema = z.object({
  studentNumber: z
    .string()
    .trim()
    .min(5, "Student number must be at least 5 characters."),
});

export const concernSchema = z.object({
  subject: z.string().trim().min(5, "Subject must be at least 5 characters."),
  category: z.enum(STUDENT_CONCERN_CATEGORIES, {
    error: "Choose the concern type that matches the request.",
  }),
  message: z
    .string()
    .trim()
    .min(15, "Please describe the concern with at least 15 characters."),
});

export const replySchema = z.object({
  message: z.string().trim().min(10, "Reply must be at least 10 characters."),
  status: z.enum(["OPEN", "ANSWERED", "CLOSED"]),
});

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    password: z.string().trim().optional(),
    confirmPassword: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (!data.password && !data.confirmPassword) {
        return true;
      }

      return (data.password?.length ?? 0) >= 8;
    },
    {
      message: "New password must be at least 8 characters.",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (!data.password && !data.confirmPassword) {
        return true;
      }

      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export const scheduleEntrySchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters."),
    location: z
      .string()
      .trim()
      .min(2, "Location must be at least 2 characters."),
    notes: z.string().trim().optional(),
    startsAt: z.string().trim().min(1, "Start time is required."),
    endsAt: z.string().trim().min(1, "End time is required."),
  })
  .refine(
    (data) => {
      const startsAt = new Date(`${data.startsAt}:00+08:00`);
      const endsAt = new Date(`${data.endsAt}:00+08:00`);

      return startsAt.getTime() < endsAt.getTime();
    },
    {
      message: "End time must be later than start time.",
      path: ["endsAt"],
    },
  );
