import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/lib/validation";

const common = {
  fullName: "Demo Candidate",
  email: "candidate@example.test",
  mobile: "+919000000000",
  currentLocation: "Hyderabad",
  preferredLocations: ["Hyderabad"],
  preferredJobRoles: ["Frontend Developer"],
  keySkills: ["React", "TypeScript"],
  privacyConsent: true as const,
  jobAlertConsent: false,
};

describe("candidate registration validation", () => {
  it("accepts the Fresher-specific required fields without experienced-only data", () => {
    const result = registrationSchema.safeParse({
      ...common,
      employmentType: "fresher",
      highestQualification: "B.Tech Computer Science",
      graduationYear: 2026,
    });

    expect(result.success).toBe(true);
  });

  it("requires education information for a Fresher", () => {
    const result = registrationSchema.safeParse({ ...common, employmentType: "fresher" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["highestQualification", "graduationYear"]),
      );
    }
  });

  it("requires relevant employment data for an Experienced candidate", () => {
    const result = registrationSchema.safeParse({ ...common, employmentType: "experienced" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["totalExperienceMonths", "currentCompany", "currentRole", "currentCtc", "expectedCtc", "noticePeriodDays"]),
      );
    }
  });

  it("requires processing consent for every candidate", () => {
    const result = registrationSchema.safeParse({
      ...common,
      employmentType: "fresher",
      highestQualification: "B.Com",
      graduationYear: 2025,
      privacyConsent: false,
    });

    expect(result.success).toBe(false);
  });
});
