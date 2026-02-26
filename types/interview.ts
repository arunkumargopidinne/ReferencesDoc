export type Topic = { id: string; title: string; notes?: string };

export type InterviewInput = {
  companyName: string;
  jobDescription: string;
  techStack: string;
};

export type ContentResult = {
  markdown: string;
};
