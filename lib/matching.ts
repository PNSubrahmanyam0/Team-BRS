import type { Candidate, EligibilityFailure, MatchResult, Vacancy } from "@/lib/types";

const normalise = (value: string) => value.trim().toLocaleLowerCase();
const asSet = (values: string[]) => new Set(values.map(normalise).filter(Boolean));
const sameText = (left: string, right: string) => normalise(left) === normalise(right);

function overlap(left: string[], right: string[]) {
  const rightSet = asSet(right);
  return [...asSet(left)].filter((value) => rightSet.has(value));
}

function hasQualification(candidate: Candidate, requirements: string[]) {
  if (requirements.length === 0) return true;
  if (!candidate.highestQualification) return false;
  return requirements.some((requirement) =>
    normalise(candidate.highestQualification!).includes(normalise(requirement)),
  );
}

/**
 * Deterministic matching deliberately runs before any LLM review. A high score
 * can never overcome an eligibility failure; that protects candidates from
 * receiving a recommendation for a vacancy they cannot enter.
 */
export function evaluateMatch(candidate: Candidate, vacancy: Vacancy): MatchResult {
  const failures: EligibilityFailure[] = [];

  if (vacancy.status !== "active") failures.push("vacancy_not_available");
  if (vacancy.employerVerificationStatus !== "verified") failures.push("employer_not_verified");
  if (
    vacancy.experienceMinMonths !== undefined &&
    candidate.totalExperienceMonths < vacancy.experienceMinMonths
  ) {
    failures.push("experience_below_minimum");
  }
  if (
    vacancy.experienceMaxMonths !== undefined &&
    candidate.totalExperienceMonths > vacancy.experienceMaxMonths
  ) {
    failures.push("experience_above_maximum");
  }

  const matchedMandatory = overlap(candidate.keySkills, vacancy.mandatorySkills);
  const missingSkills = vacancy.mandatorySkills.filter(
    (skill) => !matchedMandatory.includes(normalise(skill)),
  );
  if (missingSkills.length > 0) failures.push("missing_mandatory_skills");
  if (!hasQualification(candidate, vacancy.qualificationRequirements)) {
    failures.push("qualification_not_met");
  }
  if (
    vacancy.graduationYearMinimum !== undefined &&
    (candidate.graduationYear === undefined || candidate.graduationYear < vacancy.graduationYearMinimum)
  ) {
    failures.push("graduation_year_not_met");
  }

  const experienceScore =
    vacancy.experienceMinMonths === undefined
      ? 25
      : Math.min(25, (candidate.relevantExperienceMonths / Math.max(vacancy.experienceMinMonths, 1)) * 25);
  const allVacancySkills = [...vacancy.mandatorySkills, ...vacancy.preferredSkills];
  const matchedSkills = overlap(candidate.keySkills, allVacancySkills);
  const skillsScore = allVacancySkills.length === 0 ? 25 : (matchedSkills.length / asSet(allVacancySkills).size) * 25;
  const domainScore =
    vacancy.domain && candidate.currentRole && candidate.currentRole.toLocaleLowerCase().includes(vacancy.domain.toLocaleLowerCase())
      ? 20
      : vacancy.domain && candidate.preferredJobRoles.some((role) => role.toLocaleLowerCase().includes(vacancy.domain!.toLocaleLowerCase()))
        ? 12
        : vacancy.domain
          ? 0
          : 20;
  const qualificationScore = hasQualification(candidate, vacancy.qualificationRequirements) ? 15 : 0;
  const locationScore = candidate.preferredLocations.some((location) => sameText(location, vacancy.location)) ? 10 : vacancy.workMode === "remote" ? 8 : 0;
  const preferenceScore = candidate.preferredJobRoles.some((role) => sameText(role, vacancy.jobTitle)) ? 5 : 0;
  const score = Math.round(
    experienceScore + skillsScore + domainScore + qualificationScore + locationScore + preferenceScore,
  );
  const eligible = failures.length === 0;
  const route = !eligible ? "do_not_recommend" : score >= 85 ? "recommend" : score >= 70 ? "review" : "do_not_recommend";
  const matchedSkillLabels = allVacancySkills.filter((skill) => matchedSkills.includes(normalise(skill)));
  const explanation = !eligible
    ? `Not eligible: ${failures.map((failure) => failure.replaceAll("_", " ")).join(", ")}.`
    : `Score ${score}% based on relevant experience, ${matchedSkillLabels.length} matching skill${matchedSkillLabels.length === 1 ? "" : "s"}, qualification, location, and role preferences.`;

  return {
    score,
    eligible,
    route,
    mandatoryFailures: failures,
    matchedSkills: matchedSkillLabels,
    missingSkills,
    scoreBreakdown: {
      relevantExperience: Math.round(experienceScore),
      skills: Math.round(skillsScore),
      domain: Math.round(domainScore),
      qualification: Math.round(qualificationScore),
      locationAndShift: Math.round(locationScore),
      preferences: Math.round(preferenceScore),
    },
    explanation,
  };
}
