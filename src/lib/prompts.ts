// // // Centralized AI prompts shared by API routes.

// // // extract-topics
// // export const EXTRACT_TOPICS_SYSTEM =
// // "You are an experienced interview expert.Based on the following interview questions asked to multiple students, identify and list ONLY the key topics that were actually asked in the interviews.And also generate additional closely related fundamentals and intermediate topics that are commonly asked in similar technical interviews."
// // "After listing the asked topics, add more closely related fundamentals to intermediate topics that are commonly asked in similar technical interviews."
// // "Generate 30-40 overall topics."
// // "Rules to follow: Keep the output topic names only, no explanations"
// // "Interview Questions Context:"

// // "Section 1: Topics Asked in Interview"
// // "Section 2: Additional Related Topics That Can Be Asked in Interviews"

// // export function buildExtractTopicsUserPrompt(
// //   companyName: string,
// //   techStack: string,
// //   jobDescription: string
// // ): string {
// //   return (
// //     `Company: ${companyName || "Not specified"}\n` +
// //     `Tech Stack: ${techStack || "Not specified"}\n\n` +
// //     `Interview context:\n${jobDescription}\n\n` +
// //     `Task:\n` +
// //     `1) Extract topics clearly asked or strongly implied in the context.\n` +
// //     `2) Add additional fundamentals/intermediate topics relevant to this stack.\n` +
// //     `3) Avoid duplicates.\n\n` +
// //     `Return STRICT JSON only:\n` +
// //     `{\n` +
// //     `  "topics": [\n` +
// //     `    {\n` +
// //     `      "id": "unique-kebab-slug",\n` +
// //     `      "title": "Specific Topic Title",\n` +
// //     `      "section": "asked" | "additional",\n` +
// //     `      "level": "basic" | "intermediate"\n` +
// //     `    }\n` +
// //     `  ]\n` +
// //     `}\n\n` +
// //     `No markdown. No explanation text.`
// //   );
// // }

// // // generate-techstack
// // export const GENERATE_TECHSTACK_SYSTEM =
// //   "You are a senior technical interviewer. Return strict JSON only.";

// // export function buildGenerateTechstackUserPrompt(
// //   companyName: string,
// //   techStack: string
// // ): string {
// //   return (
// //     `Company: ${companyName || "Not specified"}\n` +
// //     `Tech Stack: ${techStack}\n\n` +
// //     `Generate interview preparation topics from basic to intermediate depth.\n` +
// //     `Create a strong and practical list for each technology in the stack.\n\n` +
// //     `Rules:\n` +
// //     `- Use specific, concrete topic titles (not generic labels).\n` +
// //     `- Cover fundamentals, internals, usage patterns, trade-offs, debugging, testing, and security.\n` +
// //     `- Include both direct tech topics and cross-cutting fundamentals.\n` +
// //     `- Avoid duplicates.\n\n` +
// //     `Return STRICT JSON only:\n` +
// //     `{\n` +
// //     `  "topics": [\n` +
// //     `    {\n` +
// //     `      "id": "unique-kebab-case-slug",\n` +
// //     `      "title": "Specific Descriptive Topic Title",\n` +
// //     `      "section": "asked" | "additional",\n` +
// //     `      "tech": "Technology name or Fundamentals",\n` +
// //     `      "level": "basic" | "intermediate"\n` +
// //     `    }\n` +
// //     `  ]\n` +
// //     `}\n\n` +
// //     `No markdown. No code fences. No text outside JSON.`
// //   );
// // }

// // // generate-content
// // // ─── REPLACE the generate-content section in your prompts.ts ─────────────────
// // // Replace from "// generate-content" down to the end of buildGenerateContentChunkPrompt

// // // generate-content


// // // export const GENERATE_CONTENT_SYSTEM = `Create a comprehensive reference document that addresses the provided topic. For each topic, provide a detailed and thorough explanation of the solution, ensuring clarity and comprehensiveness in the response. Organize the document in a structured format, using clear headings and concise summaries to facilitate easy navigation and understanding. Include step-by-step explanations and support them with relevant examples or illustrations where applicable. Maintain a formal tone throughout the document. 
// // // Enhanced Prompt: Develop a comprehensive reference document that thoroughly addresses the provided topics. For each question, offer a detailed and in-depth explanation of the solution, ensuring clarity and thoroughness in the response. Structure the document in a clear and organized manner, utilizing distinct headings and concise summaries to enhance navigation and comprehension. Provide step-by-step explanations and incorporate relevant examples or illustrations where necessary to support the content. Maintain a formal and professional tone throughout the document.

// // // OUTPUT FORMAT — follow this EXACTLY as shown in the examples:

// // // For CONCEPTUAL topics, use this structure:
// // // In detailed explaining about the topic.So that can be easily understand by students who are preparing for interviews.after in detailed explanation generate few bullet points for preparation.
// // // generate short and concise summary of the topic at the end of the explanation.


// // // Then numbered or bulleted breakdown with **Bold Label:** followed by explanation. Use \`inline code\` for all technical terms, class names, methods, and keywords.

// // // For COMPARISON topics (e.g. "X vs Y", "difference between X and Y"):
// // // A 1–2 sentence intro.
// // // Then a Markdown table with columns: | Feature | X | Y | covering 6–10 meaningful dimensions.
// // // No additional subheadings needed.

// // // STRICT RULES:
// // // - DO NOT use subheadings like "How It Works", "Internals/Gotchas", "Interview Depth", "In an interview say", "Key Takeaways", "Real-world example", "When to use", "Trade-offs"
// // // - DO NOT use emoji icons anywhere
// // // - DO NOT use phrases like "This is important", "Understanding X is crucial", "Strong candidates know"
// // // - DO NOT add interview coaching, tips, or meta-commentary
// // // - DO NOT add or include "⚡ In an interview, say:"
// // // - Use **bold** only for labels within bullet/numbered points
// // // - Use \`backticks\` for all code, class names, method names, keywords
// // // - Include a code block only when it directly illustrates the concept
// // // - Minimum 100 words of substantive content
// // // - Return pure Markdown only`;

// // export const GENERATE_CONTENT_SYSTEM = `Create a comprehensive reference document that addresses the provided topic. For each topic, provide a detailed and thorough explanation of the solution, ensuring clarity and comprehensiveness in the response. Organize the document in a structured format, using clear headings and concise summaries to facilitate easy navigation and understanding. Include step-by-step explanations and support them with relevant examples or illustrations where applicable. Maintain a formal tone throughout the document. 
// // // Enhanced Prompt: Develop a comprehensive reference document that thoroughly addresses the provided topics. For each question, offer a detailed and in-depth explanation of the solution, ensuring clarity and thoroughness in the response. Structure the document in a clear and organized manner, utilizing distinct headings and concise summaries to enhance navigation and comprehension. Provide step-by-step explanations and incorporate relevant examples or illustrations where necessary to support the content. Maintain a formal and professional tone throughout the document.

// // OUTPUT STRUCTURE — follow this exact pattern for every topic:

// // 1. Write a detailed paragraph explanation of the topic (4–6 sentences). Explain what it is, how it works, and why it matters — in plain, clear language a student can understand.

// // 2. Then write exactly 5–8 bullet points summarizing the key facts. Each bullet must:
// //    - Start with a **Bold Label:**
// //    - Follow with a concise 1–2 sentence explanation
// //    - Use \`inline code\` for all technical terms, class names, methods, and keywords

// // For COMPARISON topics (e.g. "X vs Y", "difference between X and Y"):
// // - Write a 1–2 sentence intro
// // - Then a Markdown table: | Feature | X | Y | with 6–10 rows
// // - Then 5–8 bullet points on key distinctions

// // Include a code block only when it directly illustrates the concept (concise, under 20 lines).

// // STRICT RULES:
// // - DO NOT use subheadings like "How It Works", "Internals", "Interview Depth", "Key Takeaways", "When to use", "Trade-offs", "Real-world example"
// // - DO NOT add any "In an interview say/mention" section
// // - DO NOT use emoji icons anywhere
// // - DO NOT use phrases like "This is important" or "Understanding X is crucial"
// // - Use **bold** only for bullet point labels
// // - Return pure Markdown only`;

// // export function buildGenerateContentChunkPrompt(topicTitle: string): string {
// //   return (
// //     `${GENERATE_CONTENT_SYSTEM}\n\n` +
// //     `Generate the reference document section for:\n\n` +
// //     `## ${topicTitle}`
// //   ).trim();
// // }




// // // generate-answers
// // export const GENERATE_ANSWERS_SYSTEM =
// //   "Return Markdown only. Do not wrap the full response in a code block.";

// // export function buildGenerateAnswersPrompt(
// //   companyName: string,
// //   chunkQuestions: string[],
// //   chunkIndex: number,
// //   totalChunks: number
// // ): string {
// //   return (
// //     `Company: ${companyName || "N/A"}\n` +
// //     `Chunk ${chunkIndex + 1} of ${totalChunks}\n\n` +
// //     `Answer each question below as a strong interview-ready candidate would.\n\n` +
// //     `Rules:\n` +
// //     `- Use ### for each question heading exactly as written.\n` +
// //     `- Use #### subheadings inside each answer when needed.\n` +
// //     `- Do not use ## headings.\n` +
// //     `- Do not add Part headings, chunk headings, or preamble text.\n` +
// //     `- DO NOT add any "⚡ In an interview, say:"\n` +
// //     `- Add practical examples and short snippets when useful.\n` +
// //     `- End each answer with **In an interview, mention:** and 2-3 bullets.\n\n` +
// //     `Questions:\n` +
// //     `${chunkQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}`
// //   );
// // }

// // // generate-assignment
// // export function buildGenerateAssignmentPrompt(
// //   assignmentText: string,
// //   companyName?: string,
// //   overrides?: {
// //     frontendTechnologies?: string;
// //     backendTechnologies?: string;
// //     timeline?: string;
// //   }
// // ): string {
// //   const frontendOverride = overrides?.frontendTechnologies?.trim() || "";
// //   const backendOverride = overrides?.backendTechnologies?.trim() || "";
// //   const timelineOverride = overrides?.timeline?.trim() || "";

// //   return `
// // You are creating a detailed assignment reference document for students.

// // Core objective:
// // - Preserve assignment scope and expected outcomes.
// // - Explain implementation clearly for beginners and interview preparation.

// // Important overrides:
// // - If frontend technologies are provided, use them instead of conflicting frontend stacks in the assignment.
// // - If backend technologies are provided, use them instead of conflicting backend stacks in the assignment.
// // - Keep all other assignment requirements unchanged.
// // - If timeline is provided, include a timeline section using that value.

// // Output: Markdown only.

// // Required structure (in order):
// // 1. Objective
// // 2. Technical Requirements
// // 3. Step-by-Step Instructions
// // 4. Project Structure
// // 5. Timeline and Milestones (only when timeline input exists OR assignment explicitly includes timeline)
// // 6. Submission Guidelines

// // Technical Requirements format:
// // - Frontend
// // - Backend
// // - Database
// // - Optional/Bonus

// // Submission Guidelines must be the final section and include:
// // - GitHub Repository Link
// // - Published/Deployed Project Link
// // - Screen Recording Link

// // Company: ${companyName ?? "N/A"}
// // Frontend technologies override: ${frontendOverride || "Not provided"}
// // Backend technologies override: ${backendOverride || "Not provided"}
// // Timeline override: ${timelineOverride || "Not provided"}

// // Assignment:
// // ${assignmentText}
// // `.trim();
// // }

// // // regenerate-content
// // export function buildRegenerateContentPrompt(
// //   topics: Array<{ title: string }>,
// //   previousMarkdown: string
// // ): string {
// //   return (
// //     `Improve and expand the markdown while preserving topic order.\n` +
// //     `Use ## for topic headings and ### for subheadings.\n` +
// //     `Return only updated Markdown.\n\n` +
// //     `Previous content:\n${previousMarkdown || ""}\n\n` +
// //     `Topics:\n${topics.map((t) => "- " + t.title).join("\n")}`
// //   );
// // }

// // Centralized AI prompts shared by API routes.

// // extract-topics
// export const EXTRACT_TOPICS_SYSTEM =
//   "You are an experienced interview expert. Based on the following interview questions asked to multiple students, identify and list ONLY the key topics that were actually asked in the interviews. " +
//   "After listing the asked topics, add more closely related fundamentals to intermediate topics that are commonly asked in similar technical interviews. " +
//   "Generate exactly 30–40 overall topics. " +
//   "Rules to follow: Keep the output topic names only, no explanations. " +
//   "Section 1: Topics Asked in Interview. " +
//   "Section 2: Additional Related Topics That Can Be Asked in Interviews.";

// export function buildExtractTopicsUserPrompt(
//   companyName: string,
//   techStack: string,
//   jobDescription: string
// ): string {
//   return (
//     `Company: ${companyName || "Not specified"}\n` +
//     `Tech Stack: ${techStack || "Not specified"}\n\n` +
//     `Interview context:\n${jobDescription}\n\n` +
//     `Task:\n` +
//     `1) Extract topics clearly asked or strongly implied in the context.\n` +
//     `2) Add additional fundamentals/intermediate topics relevant to this stack.\n` +
//     `3) Avoid duplicates.\n` +
//     `4) Generate exactly 30–40 topics total.\n\n` +
//     `Return STRICT JSON only:\n` +
//     `{\n` +
//     `  "topics": [\n` +
//     `    {\n` +
//     `      "id": "unique-kebab-slug",\n` +
//     `      "title": "Specific Topic Title",\n` +
//     `      "section": "asked" | "additional",\n` +
//     `      "level": "basic" | "intermediate"\n` +
//     `    }\n` +
//     `  ]\n` +
//     `}\n\n` +
//     `No markdown. No explanation text.`
//   );
// }

// // generate-techstack
// export const GENERATE_TECHSTACK_SYSTEM =
//   "You are a senior technical interviewer. Return strict JSON only.";

// export function buildGenerateTechstackUserPrompt(
//   companyName: string,
//   techStack: string
// ): string {
//   return (
//     `Company: ${companyName || "Not specified"}\n` +
//     `Tech Stack: ${techStack}\n\n` +
//     `Generate interview preparation topics from basic to intermediate depth.\n` +
//     `Create a strong and practical list for each technology in the stack.\n\n` +
//     `Rules:\n` +
//     `- Use specific, concrete topic titles (not generic labels).\n` +
//     `- Cover fundamentals, internals, usage patterns, trade-offs, debugging, testing, and security.\n` +
//     `- Include both direct tech topics and cross-cutting fundamentals.\n` +
//     `- Avoid duplicates.\n\n` +
//     `Return STRICT JSON only:\n` +
//     `{\n` +
//     `  "topics": [\n` +
//     `    {\n` +
//     `      "id": "unique-kebab-case-slug",\n` +
//     `      "title": "Specific Descriptive Topic Title",\n` +
//     `      "section": "asked" | "additional",\n` +
//     `      "tech": "Technology name or Fundamentals",\n` +
//     `      "level": "basic" | "intermediate"\n` +
//     `    }\n` +
//     `  ]\n` +
//     `}\n\n` +
//     `No markdown. No code fences. No text outside JSON.`
//   );
// }

// // generate-content
// export const GENERATE_CONTENT_SYSTEM = `You are a technical documentation writer creating reference material for students preparing for interviews.

// OUTPUT STRUCTURE — follow this exact pattern for every topic:

// 1. Write a detailed paragraph explanation of the topic (4–6 sentences). Explain what it is, how it works, and why it matters — in plain, clear language a student can understand.

// 2. Then write exactly 5–8 bullet points summarizing the key facts. Each bullet must:
//    - Start with a **Bold Label:**
//    - Follow with a concise 1–2 sentence explanation
//    - Use \`inline code\` for all technical terms, class names, methods, and keywords

// For COMPARISON topics (e.g. "X vs Y", "difference between X and Y"):
// - Write a 1–2 sentence intro
// - Then a Markdown table: | Feature | X | Y | with 6–10 rows
// - Then 5–8 bullet points on key distinctions

// Include a code block only when it directly illustrates the concept (concise, under 20 lines).

// STRICT RULES:
// - DO NOT write a conclusion paragraph
// - DO NOT use phrases like "In conclusion", "To summarize", or wrap up the content at the end
// - DO NOT use subheadings like "How It Works", "Internals", "Interview Depth", "Key Takeaways", "When to use", "Trade-offs", "Real-world example"
// - DO NOT add any "In an interview say/mention" section
// - DO NOT use emoji icons anywhere
// - DO NOT use phrases like "This is important" or "Understanding X is crucial"
// - Use **bold** only for bullet point labels
// - Return pure Markdown only`;

// export function buildGenerateContentChunkPrompt(topicTitle: string): string {
//   return (
//     `${GENERATE_CONTENT_SYSTEM}\n\n` +
//     `Generate the reference document section for:\n\n` +
//     `## ${topicTitle}`
//   ).trim();
// }

// // generate-answers
// export const GENERATE_ANSWERS_SYSTEM =
//   "Return Markdown only. Do not wrap the full response in a code block.";

// export function buildGenerateAnswersPrompt(
//   companyName: string,
//   chunkQuestions: string[],
//   chunkIndex: number,
//   totalChunks: number
// ): string {
//   return (
//     `Company: ${companyName || "N/A"}\n` +
//     `Chunk ${chunkIndex + 1} of ${totalChunks}\n\n` +
//     `Answer each question below as a strong interview-ready candidate would.\n\n` +
//     `Rules:\n` +
//     `- Use ### for each question heading exactly as written.\n` +
//     `- Use #### subheadings inside each answer when needed.\n` +
//     `- Do not use ## headings.\n` +
//     `- Do not add Part headings, chunk headings, or preamble text.\n` +
//     `- Add practical examples and short snippets when useful.\n\n` +
//     `Questions:\n` +
//     `${chunkQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}`
//   );
// }

// // generate-assignment
// export function buildGenerateAssignmentPrompt(
//   assignmentText: string,
//   companyName?: string,
//   overrides?: {
//     frontendTechnologies?: string;
//     backendTechnologies?: string;
//     timeline?: string;
//   }
// ): string {
//   const frontendOverride = overrides?.frontendTechnologies?.trim() || "";
//   const backendOverride = overrides?.backendTechnologies?.trim() || "";
//   const timelineOverride = overrides?.timeline?.trim() || "";

//   return `
// You are creating a detailed assignment reference document for students.

// Core objective:
// - Preserve assignment scope and expected outcomes.
// - Explain implementation clearly for beginners and interview preparation.

// Important overrides:
// - If frontend technologies are provided, use them instead of conflicting frontend stacks in the assignment.
// - If backend technologies are provided, use them instead of conflicting backend stacks in the assignment.
// - Keep all other assignment requirements unchanged.
// - If timeline is provided, include a timeline section using that value.

// Output: Markdown only.

// Required structure (in order):
// 1. Objective
// 2. Technical Requirements
// 3. Step-by-Step Instructions
// 4. Project Structure
// 5. Timeline and Milestones (only when timeline input exists OR assignment explicitly includes timeline)
// 6. Submission Guidelines

// Technical Requirements format:
// - Frontend
// - Backend
// - Database
// - Optional/Bonus

// Submission Guidelines must be the final section and include:
// - GitHub Repository Link
// - Published/Deployed Project Link
// - Screen Recording Link

// Company: ${companyName ?? "N/A"}
// Frontend technologies override: ${frontendOverride || "Not provided"}
// Backend technologies override: ${backendOverride || "Not provided"}
// Timeline override: ${timelineOverride || "Not provided"}

// Assignment:
// ${assignmentText}
// `.trim();
// }

// // regenerate-content
// export function buildRegenerateContentPrompt(
//   topics: Array<{ title: string }>,
//   previousMarkdown: string
// ): string {
//   return (
//     `Improve and expand the markdown while preserving topic order.\n` +
//     `Use ## for topic headings and ### for subheadings.\n` +
//     `Return only updated Markdown.\n\n` +
//     `Previous content:\n${previousMarkdown || ""}\n\n` +
//     `Topics:\n${topics.map((t) => "- " + t.title).join("\n")}`
//   );
// }



// Centralized AI prompts shared by API routes.

// extract-topics
export const EXTRACT_TOPICS_SYSTEM =
  "You are an experienced interview expert. Based on the following interview questions asked to multiple students, identify and list ONLY the key topics that were actually asked in the interviews. " +
  "After listing the asked topics, add more closely related fundamentals to intermediate topics that are commonly asked in similar technical interviews. " +
  "Generate exactly 30–40 overall topics. " +
  "Rules to follow: Keep the output topic names only, no explanations. " +
  "Section 1: Topics Asked in Interview. " +
  "Section 2: Additional Related Topics That Can Be Asked in Interviews.";

export function buildExtractTopicsUserPrompt(
  companyName: string,
  techStack: string,
  jobDescription: string
): string {
  return (
    `Company: ${companyName || "Not specified"}\n` +
    `Tech Stack: ${techStack || "Not specified"}\n\n` +
    `Interview context:\n${jobDescription}\n\n` +
    `Task:\n` +
    `1) Extract topics clearly asked or strongly implied in the context.\n` +
    `2) Add additional fundamentals/intermediate topics relevant to this stack.\n` +
    `3) Avoid duplicates.\n` +
    `4) Generate exactly 30–40 topics total.\n\n` +
    `Return STRICT JSON only:\n` +
    `{\n` +
    `  "topics": [\n` +
    `    {\n` +
    `      "id": "unique-kebab-slug",\n` +
    `      "title": "Specific Topic Title",\n` +
    `      "section": "asked" | "additional",\n` +
    `      "level": "basic" | "intermediate"\n` +
    `    }\n` +
    `  ]\n` +
    `}\n\n` +
    `No markdown. No explanation text.`
  );
}

// generate-techstack
export const GENERATE_TECHSTACK_SYSTEM =
  "You are job is to generate topics based on tech stacks from basic level to intermediate which are commonly asked in technical interviews and help full to students or candidates who are preparing for interview.Do not generate repeated topics. Return strict JSON only.";

export function buildGenerateTechstackUserPrompt(
  companyName: string,
  techStack: string
): string {
  return (
    `Company: ${companyName || "Not specified"}\n` +
    `Tech Stack: ${techStack}\n\n` +
    `Generate Basic to intermediate level topics for each technology listed which are most relevant to technical interviews.\n` +
    `For each technology, generate 20–25 topics covering basic to advanced depth.\n\n` +
    `Rules:\n` +
    `- Use specific, concrete topic titles (not generic labels).\n` +
    `- Cover: core fundamentals, internals, advanced concepts, design patterns, performance optimization, debugging, testing, security, real-world usage, and common interview questions.\n` +
    `- Include both direct tech topics and cross-cutting fundamentals.\n` +
    `- Avoid duplicates.\n` +
    `- Generate at least 20 topics per technology.\n\n` +
    `Return STRICT JSON only:\n` +
    `{\n` +
    `  "topics": [\n` +
    `    {\n` +
    `      "id": "unique-kebab-case-slug",\n` +
    `      "title": "Specific Descriptive Topic Title",\n` +
    `      "section": "asked" | "additional",\n` +
    `      "tech": "Technology name or Fundamentals",\n` +
    `      "level": "basic" | "intermediate"\n` +
    `    }\n` +
    `  ]\n` +
    `}\n\n` +
    `No markdown. No code fences. No text outside JSON.`
  );
}

// generate-content
export const GENERATE_CONTENT_SYSTEM = `You are a technical documentation writer creating quick-reference material for students preparing for interviews.

For every topic, follow this exact structure — nothing more, nothing less:

1. EXPLANATION (3–4 sentences max)
   - Write a clear, direct explanation of what the topic is and how it works
   - Use simple language a student can quickly read and understand
   - Stay strictly on the given topic — do not generalize or introduce unrelated concepts

2. KEY POINTS (5–6 bullet points)
   - Each bullet starts with **Label:** where Label is the actual concept name
   - Follow with 1 sentence explanation
   - Use \`inline code\` for all technical terms, class names, method names, and keywords

3. CODE SNIPPET (only if the topic is code-related)
   - Include one small, focused code block (5–10 lines max)
   - Only include if it genuinely clarifies the concept
   - Skip entirely for non-coding topics

For COMPARISON topics (e.g. "X vs Y", "difference between X and Y"):
   - 1 sentence intro
   - Markdown table: | Feature | X | Y | with 5–7 rows
   - 4–5 bullet points on key distinctions

STRICT RULES — never break these:
- DO NOT GENERATE ant thing after code snippet or after key points section.
- DO NOT write a conclusion or summary at the end
- DO NOT add any "In an interview, say/mention, ⚡ In an interview, say" section
- DO NOT use emoji anywhere
- DO NOT write the literal words "Bold Label" — always use the real label name
- DO NOT add subheadings like "Explanation", "Key Points", "Summary", "Overview", "How It Works", "When to Use", "Trade-offs"
- DO NOT use filler phrases like "This is important", "In conclusion", "To summarize", "Understanding X is crucial"
- DO NOT pad content — keep it short and scannable
- Use **bold** only for bullet label names
- Return pure Markdown only`;

export function buildGenerateContentChunkPrompt(topicTitle: string): string {
  return (
    `${GENERATE_CONTENT_SYSTEM}\n\n` +
    `Generate the quick-reference section for this topic:\n\n` +
    `## ${topicTitle}`
  ).trim();
}

// generate-answers
export const GENERATE_ANSWERS_SYSTEM =
  "You are a senior software engineer answering technical interview questions in detail.That helps students understand the concepts better. " +
  "Return Markdown only. Do not wrap the full response in a code block.";

export function buildGenerateAnswersPrompt(
  companyName: string,
  chunkQuestions: string[],
  chunkIndex: number,
  totalChunks: number
): string {
  return (
    `Company: ${companyName || "N/A"}\n` +
    `Chunk ${chunkIndex + 1} of ${totalChunks}\n\n` +
    `Answer each question below in detail as a senior engineer would in a technical interview.\n\n` +
    `For each answer:\n` +
    `- Write a clear 3–5 sentence explanation of the concept\n` +
    `- Add 4–6 bullet points covering key facts, edge cases, and practical usage\n` +
    `- Include a small code snippet (5–15 lines) if the topic is code-related\n` +
    `- Use \`inline code\` for all technical terms, class names, method names, and keywords\n\n` +
    `COMPARISON QUESTIONS — if the question contains "difference between", "vs", "versus", "compare", "X or Y":\n` +
    `- Write a 1–2 sentence intro explaining both concepts\n` +
    `- Generate a Markdown table: | Feature | X | Y | with 6–8 meaningful rows\n` +
    `- Follow with 4–5 bullet points on key distinctions and when to use each\n` +
    `- Include a code snippet only if it directly clarifies the difference\n\n` +
    `Formatting rules:\n` +
    `- Use ### for each question heading exactly as written\n` +
    `- Do not use ## headings\n` +
    `- Do not add Part headings, chunk headings, or preamble text\n` +
    `- Do not use emoji anywhere\n` +
    `- Do not write the literal words "Bold Label" — use the real label name\n` +
    `- Do not add any "In an interview, say/mention" section\n` +
    `- Do not write a conclusion or summary at the end\n\n` +
    `Questions:\n` +
    `${chunkQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}`
  );
}

// generate-assignment
export function buildGenerateAssignmentPrompt(
  assignmentText: string,
  companyName?: string,
  overrides?: {
    frontendTechnologies?: string;
    backendTechnologies?: string;
    timeline?: string;
  }
): string {
  const frontendOverride = overrides?.frontendTechnologies?.trim() || "";
  const backendOverride = overrides?.backendTechnologies?.trim() || "";
  const timelineOverride = overrides?.timeline?.trim() || "";

  return `
"your task is to create comprehensive assignment reference document in detialed step by  step like a begineer also can easily understand the each step can do this way 
 
each step way like first objective next techincal requirements and next how to do project step by step and next project strucutre and some exmaple codes no need of fullcodes 
 
Create a comprehensive assignment reference document that outlines a project in detailed, step-by-step instructions, ensuring clarity for beginners. Structure the document as follows:  1. **Objective**: Clearly state the project's goal and purpose. 2. **Technical Requirements**: List all necessary tools, software, and hardware specifications. 3. **Step-by-Step Instructions**: Provide a sequential guide on how to complete the project, breaking down complex tasks into manageable steps. 4. **Project Structure**: Outline the organizational framework of the project, including any relevant directories, files, and components. 5. **Example Codes**: Include relevant code snippets to illustrate key concepts, without providing full code solutions.  Ensure each step is concise, actionable, and easy to follow, with a focus on guiding the reader through the project's completion."

Core objective:
- Preserve assignment scope and expected outcomes.
- Explain implementation clearly for beginners and interview preparation.

Important overrides:
- If frontend technologies are provided, use them instead of conflicting frontend stacks in the assignment.
- If backend technologies are provided, use them instead of conflicting backend stacks in the assignment.
- Keep all other assignment requirements unchanged.
- If timeline is provided, include a timeline section using that value.

Output: Markdown only.

Required structure (in order):
1. Objective
2. Technical Requirements (only include relevant sections based on provided overrides and assignment content)
3. Step-by-Step Instructions
4. Project Structure
5. Timeline and Milestones (only when timeline input exists OR assignment explicitly includes timeline)
6. Submission Guidelines

Objective: 
- Clear and in detailed explain the main goals and objective of the assignment, ensuring that students understand what they are building and what features are expected.

Technical Requirements format:
- Frontend: only include if frontend technologies are explicitly mentioned in the assignment or override is provided. If not mentioned, skip entirely.
- Backend: only include if backend technologies are explicitly mentioned in the assignment or override is provided. If not mentioned, skip entirely.
- Database: only include if a database is explicitly mentioned in the assignment or override is provided. If not mentioned, skip entirely.
- Optional/Bonus: only include if bonus features are explicitly mentioned in the assignment. If not mentioned, skip entirely.
- DO NOT add any section with "Not applicable", "No backend required", or similar placeholder text. Simply omit the section if it is not relevant.

Step-by-Step Instructions:
- provide more and clear infromation about each features or each steps.
- Provide a clear, ordered list of steps to implement the assignment, breaking down the work into manageable pieces.
- provide deatiled instructions for each step, ensuring that students understand how to approach the implementation and what is expected at each stage.
- Each step should be actionable and specific, guiding students through the development process without dictating exact code solutions.
- Include any necessary setup instructions, configuration details, or important considerations for each step for each feature.
- Include small code snippets only when they directly clarify a specific instruction or requirement. Avoid large blocks of code or complete solutions.

Project Structure:
- Outline a recommended project structure, including key files and directories, to help students organize their work effectively.
- This can be a simple bullet list or a visual diagram, depending on the complexity of the assignment.

Timeline and Milestones:
- If a timeline is provided or explicitly mentioned in the assignment, include a section that breaks down the project into milestones with suggested deadlines.
- This helps students manage their time and track their progress throughout the assignment.

Submission Guidelines must be the final section and include:
GitHub Repository Link – containing the complete project source code
Published / Deployed Project Link – live application URL
Screen Recording Link – a short video explaining the project, features, and code walkthrough

Company: ${companyName ?? "N/A"}
Frontend technologies override: ${frontendOverride || "Not provided"}
Backend technologies override: ${backendOverride || "Not provided"}
Timeline override: ${timelineOverride || "Not provided"}

Assignment:
${assignmentText}
`.trim();
}

// regenerate-content
export function buildRegenerateContentPrompt(
  topics: Array<{ title: string }>,
  previousMarkdown: string
): string {
  return (
    `Improve and expand the markdown while preserving topic order.\n` +
    `Use ## for topic headings and ### for subheadings.\n` +
    `Return only updated Markdown.\n\n` +
    `Previous content:\n${previousMarkdown || ""}\n\n` +
    `Topics:\n${topics.map((t) => "- " + t.title).join("\n")}`
  );
}