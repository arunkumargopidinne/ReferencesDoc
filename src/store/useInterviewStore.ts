import { create } from 'zustand';

export type Topic = { id: string; title: string; notes?: string };

type State = {
  companyName: string;
  jobDescription: string;
  techStack: string;
  topics: Topic[];
  generatedMarkdown?: string;
  notionUrl?: string;
  setInput: (input: { companyName: string; jobDescription: string; techStack: string }) => void;
  setTopics: (topics: Topic[]) => void;
  updateTopic: (id: string, patch: Partial<Topic>) => void;
  setGenerated: (md: string) => void;
  setNotionUrl: (url: string) => void;
};

export const useInterviewStore = create<State>((set) => ({
  companyName: '',
  jobDescription: '',
  techStack: '',
  topics: [],
  generatedMarkdown: undefined,
  notionUrl: undefined,
  setInput: (input) => set(() => ({ ...input })),
  setTopics: (topics) => set({ topics }),
  updateTopic: (id, patch) =>
    set((state) => ({ topics: state.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  setGenerated: (md) => set({ generatedMarkdown: md }),
  setNotionUrl: (url) => set({ notionUrl: url }),
}));
