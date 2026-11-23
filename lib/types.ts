export type EmploymentType = "fresher" | "experienced";

export type Candidate = {
  id: string;
  candidateCode: string;
  employmentType: EmploymentType;
  fullName: string;
  email: string;
  mobile: string;
  currentLocation?: string;
  preferredLocations: string[];
  preferredJobRoles: string[];
  keySkills: string[];
  highestQualification?: string;
  graduationYear?: number;
  totalExperienceMonths: number;
  relevantExperienceMonths: number;
  currentCompany?: string;
  employeeId?: string;
  currentRole?: string;
  currentCtc?: number;
  expectedCtc?: number;
  noticePeriodDays?: number;
  profileCompletion: number;
};

export type Vacancy = {
  id: string;
  companyName: string;
  jobTitle: string;
  domain?: string;
  location: string;
  workMode: "onsite" | "hybrid" | "remote";
  shift?: string;
  packageMin?: number;
  packageMax?: number;
  experienceMinMonths?: number;
  experienceMaxMonths?: number;
  qualificationRequirements: string[];
  graduationYearMinimum?: number;
  mandatorySkills: string[];
  preferredSkills: string[];
  status: "draft" | "pending_review" | "active" | "closed" | "filled" | "expired" | "archived";
  employerVerificationStatus: "unverified" | "verified" | "rejected";
  applicationDeadline?: string;
};

export type EligibilityFailure =
  | "vacancy_not_available"
  | "employer_not_verified"
  | "experience_below_minimum"
  | "experience_above_maximum"
  | "missing_mandatory_skills"
  | "qualification_not_met"
  | "graduation_year_not_met";

export type MatchResult = {
  score: number;
  eligible: boolean;
  route: "recommend" | "review" | "do_not_recommend";
  mandatoryFailures: EligibilityFailure[];
  matchedSkills: string[];
  missingSkills: string[];
  scoreBreakdown: {
    relevantExperience: number;
    skills: number;
    domain: number;
    qualification: number;
    locationAndShift: number;
    preferences: number;
  };
  explanation: string;
};

export type RegistrationInput = {
  employmentType: EmploymentType;
  fullName: string;
  email: string;
  mobile: string;
  currentLocation: string;
  preferredLocations: string[];
  preferredJobRoles: string[];
  keySkills: string[];
  highestQualification?: string;
  graduationYear?: number;
  totalExperienceMonths?: number;
  currentCompany?: string;
  currentRole?: string;
  currentCtc?: number;
  expectedCtc?: number;
  noticePeriodDays?: number;
  lastWorkingDay?: string;
  certifications?: string;
  projects?: string;
  privacyConsent: boolean;
  jobAlertConsent: boolean;
};
