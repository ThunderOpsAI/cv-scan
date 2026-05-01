const INTERVIEW_TITLE_PREFIX = "Interview Practice:";

export function buildInterviewConversationTitle(role: string, company: string) {
  return `${INTERVIEW_TITLE_PREFIX} ${role.trim()} @ ${company.trim()}`;
}

export function parseInterviewConversationTitle(title: string) {
  if (!title.startsWith(INTERVIEW_TITLE_PREFIX)) {
    return null;
  }

  const raw = title.slice(INTERVIEW_TITLE_PREFIX.length).trim();
  const [role, company] = raw.split(" @ ");

  return {
    role: role?.trim() || "Software Engineer",
    company: company?.trim() || "Hiring Team",
  };
}

export function isInterviewConversationTitle(title: string) {
  return title.startsWith(INTERVIEW_TITLE_PREFIX);
}
