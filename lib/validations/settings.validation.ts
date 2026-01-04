import { z } from "zod";

export const updateSettingsSchema = z.object({
  incubatorName: z.string().min(2, "Name required").optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
