import { z } from "zod";

/**
 * Profile form validation schema
 */
export const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  walletAddress: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^[A-Za-z0-9]{44}$/.test(val),
      "Invalid Solana wallet address"
    ),
  youtubeUrl: z
    .string()
    .url("Invalid YouTube URL")
    .optional()
    .or(z.literal("")),
  twitterUrl: z
    .string()
    .url("Invalid Twitter URL")
    .optional()
    .or(z.literal("")),
  discordUsername: z
    .string()
    .max(32, "Discord username must be less than 32 characters")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
