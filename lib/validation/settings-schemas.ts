import { z } from "zod";

// Category form validation schema
export const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  description: z.string().min(1, "Description is required"),
  hourlyRate: z
    .number()
    .min(1, "Hourly rate must be greater than 0")
    .max(1000, "Hourly rate cannot exceed $1000"),
  experienceLevel: z
    .number()
    .min(1, "Experience level must be at least 1")
    .max(10, "Experience level cannot exceed 10"),
});

// Document upload form validation schema
export const documentSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    )
    .refine(
      (file) =>
        ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
          file.type
        ),
      "File must be a PDF, JPEG, PNG, or JPG"
    ),
  documentType: z.enum(["Certificate", "License", "Qualification"], {
    required_error: "Document type is required",
  }),
  issuer: z.string().min(1, "Issuer is required"),
  country: z.string().min(1, "Country is required"),
  certificationType: z.string().min(1, "Certification type is required"),
  certificationNumber: z.string().min(1, "Certification number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters"),
  yearsExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience cannot exceed 50"),
  providesOvernight: z.boolean(),
  providesLiveIn: z.boolean(),
});

// Export type definitions
export type CategoryFormData = z.infer<typeof categorySchema>;
export type DocumentFormData = z.infer<typeof documentSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
