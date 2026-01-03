import prisma from "@/lib/prisma";
import { SETTINGS_DEFAULTS } from "@/lib/constants";
import type { UpdateSettingsInput } from "@/lib/validations/settings.validation";

export const settingsService = {
  // Get settings (or create default if none exist)
  async get() {
    let settings = await prisma.incubatorSettings.findFirst();

    if (!settings) {
      settings = await prisma.incubatorSettings.create({
        data: {
          incubatorName: SETTINGS_DEFAULTS.INCUBATOR_NAME,
          updateFrequency: SETTINGS_DEFAULTS.UPDATE_FREQUENCY,
          autoApproveExpenses: SETTINGS_DEFAULTS.AUTO_APPROVE_EXPENSES,
        },
      });
    }

    return settings;
  },

  // Update settings
  async update(data: UpdateSettingsInput) {
    const existing = await this.get();

    return prisma.incubatorSettings.update({
      where: { id: existing.id },
      data: {
        ...(data.incubatorName !== undefined && {
          incubatorName: data.incubatorName,
        }),
        ...(data.updateFrequency !== undefined && {
          updateFrequency: data.updateFrequency,
        }),
        ...(data.autoApproveExpenses !== undefined && {
          autoApproveExpenses: data.autoApproveExpenses,
        }),
      },
    });
  },
};
