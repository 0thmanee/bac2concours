import { z } from "zod";
import { UPDATE_FREQUENCY } from "@/lib/constants";

export const updateSettingsSchema = z.object({
  incubatorName: z.string().min(2, "Name required").optional(),
  updateFrequency: z
    .enum([UPDATE_FREQUENCY.WEEKLY, UPDATE_FREQUENCY.MONTHLY])
    .optional(),
  autoApproveExpenses: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
