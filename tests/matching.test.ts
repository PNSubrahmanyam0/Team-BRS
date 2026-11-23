import { describe, expect, it } from "vitest";
import { demoCandidate, demoVacancies } from "@/lib/demo-data";
import { evaluateMatch } from "@/lib/matching";

describe("evaluateMatch", () => {
  it("recommends an active verified vacancy when all mandatory requirements pass", () => {
    const result = evaluateMatch(demoCandidate, demoVacancies[0]);

    expect(result.eligible).toBe(true);
    expect(result.route).toBe("recommend");
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.matchedSkills).toContain("React");
    expect(result.missingSkills).toEqual([]);
  });

  it("never lets a high score overcome an unverified employer", () => {
    const result = evaluateMatch(demoCandidate, demoVacancies[2]);

    expect(result.score).toBeGreaterThan(70);
    expect(result.eligible).toBe(false);
    expect(result.route).toBe("do_not_recommend");
    expect(result.mandatoryFailures).toContain("employer_not_verified");
  });

  it("blocks an otherwise strong candidate with a missing mandatory skill", () => {
    const result = evaluateMatch(
      { ...demoCandidate, keySkills: ["React", "TypeScript"] },
      { ...demoVacancies[0], mandatorySkills: ["React", "TypeScript", "GraphQL"] },
    );

    expect(result.eligible).toBe(false);
    expect(result.missingSkills).toEqual(["GraphQL"]);
    expect(result.mandatoryFailures).toContain("missing_mandatory_skills");
  });

  it("keeps inactive vacancies out of automatic recommendation", () => {
    const result = evaluateMatch(demoCandidate, { ...demoVacancies[0], status: "closed" });

    expect(result.eligible).toBe(false);
    expect(result.mandatoryFailures).toContain("vacancy_not_available");
  });
});
