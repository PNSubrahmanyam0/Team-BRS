import { z } from "zod";

const delimitedList = z.array(z.string().trim().min(1)).min(1).max(20);

export const registrationSchema = z
  .object({
    employmentType: z.enum(["fresher", "experienced"]),
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    mobile: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number with country code."),
    currentLocation: z.string().trim().min(2).max(120),
    preferredLocations: delimitedList,
    preferredJobRoles: delimitedList,
    keySkills: delimitedList,
    highestQualification: z.string().trim().max(160).optional(),
    graduationYear: z.number().int().min(1950).max(new Date().getFullYear() + 8).optional(),
    totalExperienceMonths: z.number().int().min(0).max(720).optional(),
    currentCompany: z.string().trim().max(160).optional(),
    employeeId: z.string().trim().min(1).max(160).optional(),
    currentRole: z.string().trim().max(160).optional(),
    currentCtc: z.number().nonnegative().max(100000000).optional(),
    expectedCtc: z.number().nonnegative().max(100000000).optional(),
    noticePeriodDays: z.number().int().min(0).max(365).optional(),
    lastWorkingDay: z.string().date().optional(),
    certifications: z.string().trim().max(5000).optional(),
    projects: z.string().trim().max(5000).optional(),
    privacyConsent: z.literal(true),
    jobAlertConsent: z.boolean(),
  })
  .superRefine((data, context) => {
    if (data.employmentType === "fresher") {
      if (!data.highestQualification) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["highestQualification"], message: "Highest qualification is required for freshers." });
      }
      if (!data.graduationYear) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["graduationYear"], message: "Graduation year is required for freshers." });
      }
    }
    if (data.employmentType === "experienced") {
      for (const field of ["totalExperienceMonths", "currentCompany", "currentRole", "currentCtc", "expectedCtc", "noticePeriodDays"] as const) {
        if (data[field] === undefined || data[field] === "") {
          context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: "This field is required for experienced candidates." });
        }
      }
    }
  });

export type RegistrationPayload = z.infer<typeof registrationSchema>;
