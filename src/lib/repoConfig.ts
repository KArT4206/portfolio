/**
 * Presentation-only configuration for the live GitHub project feed.
 *
 * This file controls *how* repositories are displayed — it never supplies
 * project data itself. GitHub remains the single source of truth: names,
 * descriptions, stars, languages, etc. always come from the API in
 * src/lib/github.ts. Renaming/deleting a repo here does nothing to GitHub;
 * it only changes how the existing GitHub data is labeled and ordered.
 *
 * All keys are matched against the GitHub repo's exact `name` field
 * (case-sensitive), e.g. "advanced_phishing_detection", not a display title.
 */

// Repos to call out with a "Featured" badge and surface first. Only include
// repos that genuinely exist on GitHub — EGMP and the two IEEE research
// papers aren't public repos, so they live only in the hand-authored
// /projects case studies, not here.
export const featuredRepositories: string[] = [
  "advanced_phishing_detection",
  "Multi-Factor-Biometric-Authentication-System-using-Keystroke-Dynamics-and-Face-Recognition",
  "Vibe-hive_SocialBloggingMadeEasy",
  "Web-Based-DNA-Sequence-Analysis-and-Disease-Prediction-System-with-Administrative-Dashboard",
];

// Repos to exclude entirely from the feed — e.g. the special GitHub-profile
// README repo, which isn't a project.
export const hiddenRepositories: string[] = ["KArT4206"];

// Shorter display names for cards, keyed by the real repo name. Falls back
// to the raw GitHub name (with dashes/underscores humanized) if not listed.
export const repositoryAliases: Record<string, string> = {
  "Multi-Factor-Biometric-Authentication-System-using-Keystroke-Dynamics-and-Face-Recognition":
    "Multi-Factor Biometric Authentication",
  "Web-Based-DNA-Sequence-Analysis-and-Disease-Prediction-System-with-Administrative-Dashboard":
    "DNA Sequence & Disease Prediction",
  "Project_Keystroke_Dynamics_Authenticator_HMMs": "Keystroke Dynamics Authenticator",
  "Vibe-hive_SocialBloggingMadeEasy": "VibeHive — Social Blogging",
  "phishing-detection_using-ML": "Phishing Detection (ML Classifiers)",
  advanced_phishing_detection: "Advanced Phishing Detection",
  "Soil-Driven_Crop_Recommendation_System": "Soil-Driven Crop Recommendation",
  "System_Resource_Usage_Monitor_with_Email_Alerts": "System Resource Usage Monitor",
  Traffic_Light_Scheduling_System: "Traffic Light Scheduling System",
  Realtime_heart_rate_monitor: "Realtime Heart Rate Monitor",
  ai_secure_voice_assistant: "AI Secure Voice Assistant",
  "DNA-Mutation-Detection": "DNA Mutation Detection",
  "genomic-platform": "Genomic Platform",
  phishing_website: "Phishing Website Simulator",
};

// Category tags per repo, used for the technology/category filter chips.
// Independent of GitHub topics (most of these repos don't have topics set).
export const repositoryCategories: Record<string, string[]> = {
  advanced_phishing_detection: ["Cybersecurity", "AI/ML"],
  "phishing-detection_using-ML": ["Cybersecurity", "AI/ML"],
  phishing_website: ["Cybersecurity"],
  "Multi-Factor-Biometric-Authentication-System-using-Keystroke-Dynamics-and-Face-Recognition": [
    "Cybersecurity",
    "AI/ML",
  ],
  Project_Keystroke_Dynamics_Authenticator_HMMs: ["Cybersecurity", "AI/ML"],
  "Vibe-hive_SocialBloggingMadeEasy": ["Full-Stack"],
  "Web-Based-DNA-Sequence-Analysis-and-Disease-Prediction-System-with-Administrative-Dashboard": [
    "Full-Stack",
    "Bioinformatics",
  ],
  "DNA-Mutation-Detection": ["Bioinformatics", "AI/ML"],
  "genomic-platform": ["Full-Stack", "Bioinformatics"],
  Realtime_heart_rate_monitor: ["AI/ML"],
  ai_secure_voice_assistant: ["AI/ML"],
  "Soil-Driven_Crop_Recommendation_System": ["AI/ML"],
  Traffic_Light_Scheduling_System: ["Embedded"],
  System_Resource_Usage_Monitor_with_Email_Alerts: ["DevOps"],
};

// Explicit ordering override for featured repos (top to bottom). Anything
// not listed keeps its natural sort position (e.g. most-recently-updated).
export const customProjectOrder: string[] = [
  "advanced_phishing_detection",
  "Multi-Factor-Biometric-Authentication-System-using-Keystroke-Dynamics-and-Face-Recognition",
  "Vibe-hive_SocialBloggingMadeEasy",
  "Web-Based-DNA-Sequence-Analysis-and-Disease-Prediction-System-with-Administrative-Dashboard",
];

// Links a GitHub repo to its hand-authored case study in /projects/[slug],
// for the (small) set of repos that have one. Most repos won't — that's fine,
// their GitHub description/README excerpt stands on its own.
export const caseStudyLinks: Record<string, string> = {
  advanced_phishing_detection: "phishing-detection-platform",
  "Multi-Factor-Biometric-Authentication-System-using-Keystroke-Dynamics-and-Face-Recognition":
    "biometric-authentication",
  "Vibe-hive_SocialBloggingMadeEasy": "vibehive",
};

export function humanizeRepoName(name: string): string {
  return repositoryAliases[name] ?? name.replace(/[-_]+/g, " ").trim();
}
