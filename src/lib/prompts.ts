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
    `- Generate at least 25 topics per technology.\n\n` +
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
export const GENERATE_CONTENT_SYSTEM = `Create a comprehensive reference document that addresses the provided topics. For each question, provide a detailed and thorough explanation of the solution, ensuring clarity and comprehensiveness in the response. Organize the document in a structured format, using clear headings and concise summaries to facilitate easy navigation and understanding. Include step-by-step explanations and support them with relevant examples or illustrations where applicable. Maintain a formal tone throughout the document. 

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
  "You are a senior software engineer and an experienced technical mentor. Answer technical interview questions in a clear, structured, and in-depth manner that helps students truly understand the concept. Focus on depth, clarity, practical understanding, and strong technical reasoning. Adapt the structure to the specific question instead of reusing the same template for every answer. Do not force repeated subheadings such as `What`, `How`, `Why`, `Use Cases`, or `Conclusion` unless they are genuinely the best fit for that specific question. For comparison-style questions such as `X vs Y`, `difference between X and Y`, or `when to use X vs Y`, prefer a Markdown comparison table as the core of the answer. Return Markdown only. Do not wrap the full response in a code block.";

function stripQuestionNumberPrefix(question: string): string {
  return question.replace(/^\s*\d+[\).\]-]\s*/, "").trim();
}

function isComparisonQuestion(question: string): boolean {
  const normalized = stripQuestionNumberPrefix(question).toLowerCase();

  return (
    /\bvs\.?\b/.test(normalized) ||
    /\bversus\b/.test(normalized) ||
    /\bdifference between\b/.test(normalized) ||
    /\bdifferences between\b/.test(normalized) ||
    /\bcompare\b/.test(normalized) ||
    /\bcompared to\b/.test(normalized) ||
    /\bcompared with\b/.test(normalized) ||
    /\bwhen to use\b/.test(normalized)
  );
}

export function buildGenerateAnswersPrompt(
  companyName: string,
  chunkQuestions: string[],
  chunkIndex: number,
  totalChunks: number
): string {
  const normalizedQuestions = chunkQuestions
    .map(stripQuestionNumberPrefix)
    .filter(Boolean);
  const comparisonQuestions = normalizedQuestions.filter(isComparisonQuestion);
  const comparisonGuidance = comparisonQuestions.length
    ? `Comparison question rules (MANDATORY for detected comparison questions):\n` +
      `- If a question asks for \`vs\`, \`versus\`, \`difference between\`, \`compare\`, or \`when to use\`, the answer MUST include a Markdown comparison table\n` +
      `- Place the table near the start of the answer, immediately after a short intro if needed\n` +
      `- Use meaningful comparison criteria such as purpose, syntax, performance, scalability, complexity, use cases, pros/cons, and limitations\n` +
      `- Include at least 5 meaningful comparison rows whenever the topic supports it\n` +
      `- After the table, briefly explain when to choose each option, important trade-offs, and common interview pitfalls\n` +
      `- Detected comparison questions in this chunk:\n` +
      `${comparisonQuestions.map((q) => `  - ${q}`).join("\n")}\n\n`
    : "";

  return (
    `Company: ${companyName || "N/A"}\n` +
    `Chunk ${chunkIndex + 1} of ${totalChunks}\n\n` +

    `Answer each question thoroughly so that a student with basic knowledge can fully understand the concept.\n\n` +

    `Depth requirements (VERY IMPORTANT):\n` +
    `- Each answer must be sufficiently detailed (typically 6–10 sentences unless the question is very simple)\n` +
    `- Explain the concept in the way that best matches the question, with enough depth to remove confusion\n` +
    `- Include practical understanding, not just definitions\n` +
    `- Prefer substance, precision, and clarity over repeating a fixed checklist\n` +

    `Adaptive answering guidelines:\n` +
    `- Do NOT force the same structure for every question\n` +
    `- Choose the best explanation style based on the question type\n` +
    `- Do NOT mechanically organize every answer into \`what\`, \`how\`, and \`why\`\n` +
    `- Do NOT reuse the same subheadings or answer flow across all questions\n` +
    `- Use bullet points when listing important insights or behaviors\n` +
    `- Use examples when they improve clarity\n` +
    `- Include a code snippet (5–15 lines) only if it meaningfully helps understanding\n` +
    `- For comparison-style questions, prefer a Markdown table instead of plain paragraphs\n` +
    `- Use tables for comparisons when they make distinctions clearer\n\n` +

    comparisonGuidance +

    `Strong answer qualities:\n` +
    `- Clear explanation of the concept\n` +
    `- The most relevant technical depth for that specific question\n` +
    `- Real-world usage, trade-offs, limitations, edge cases, or pitfalls when relevant\n` +
    `- Enough detail to make the answer feel complete, not generic\n\n` +

    `Formatting rules:\n` +
    `- Use ### for each question heading exactly as written below, but without any numeric prefix\n` +
    `- Do not use ## headings\n` +
    `- Do not add part headings or chunk labels\n` +
    `- Do not prefix questions or answers with numbers like \`1.\`, \`2)\`, or \`Question 3\`\n` +
    `- Do not use emoji\n` +
    `- Use \`inline code\` for technical terms, keywords, and syntax\n` +
    `- Do not add a conclusion or summary section\n\n` +

    `Quality rules:\n` +
    `- Do not give short or surface-level answers\n` +
    `- Do not repeat generic statements\n` +
    `- Focus on clarity + depth + practical understanding\n\n` +

    `Questions:\n` +
    `${normalizedQuestions.map((q) => `- ${q}`).join("\n")}`
  );
}

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

  const techReplacementBlock =
    (frontendOverride
      ? `⚠ MANDATORY OVERRIDE: The assignment mentions a frontend stack. IGNORE IT COMPLETELY. You MUST use "${frontendOverride}" as the ONLY frontend technology throughout this document.\n`
      : "") +
    (backendOverride
      ? `⚠ MANDATORY OVERRIDE: The assignment mentions a backend stack. IGNORE IT COMPLETELY. You MUST use "${backendOverride}" as the ONLY backend technology throughout this document.\n`
      : "");

  return `
You are creating a comprehensive assignment reference document for students that should be in simple human language and should be able to understand easily.

Company: ${companyName ?? "N/A"}
Frontend technologies override: ${frontendOverride || "Not provided"}
Backend technologies override: ${backendOverride || "Not provided"}
Timeline override: ${timelineOverride || "Not provided"}

${techReplacementBlock}
TECHNOLOGY RULES (non-negotiable):
${frontendOverride ? `- Frontend: Use ONLY "${frontendOverride}". Do NOT mention Next.js, React, Vue, or any other frontend framework anywhere in the document.` : "- Frontend: Use whatever the assignment specifies."}
${backendOverride ? `- Backend: Use ONLY "${backendOverride}". Do NOT mention FastAPI, Python, Django, Flask, or any other backend framework anywhere in the document.` : "- Backend: Use whatever the assignment specifies."}
- Apply these technology substitutions in EVERY section: Objective, Technical Requirements, Step-by-Step Instructions, Project Structure, and code snippets.

OUTPUT FORMAT RULES (non-negotiable):
- Output pure Markdown ONLY.
- Do NOT wrap the entire response in a markdown fence.
- The response must start directly with the first heading — no preamble, no intro sentence.

Core objective:
- Preserve the assignment's feature scope and expected outcomes.
- Explain implementation clearly for beginners.

STRICT SECTION ORDER — output these sections in EXACTLY this order, nothing before, nothing after, nothing in between:
1. Objective
2. Technical Requirements
3. Step-by-Step Instructions
4. Project Structure
5. Timeline and Milestones (ONLY include if a timeline override is provided or the assignment explicitly mentions a timeline — otherwise SKIP this section entirely)
6. Submission Guidelines

⚠ CRITICAL ORDERING RULE:
- "Submission Guidelines" MUST be the ABSOLUTE LAST section in the document.
- ALL steps (including Deployment, Documentation, Testing, etc.) MUST appear INSIDE "Step-by-Step Instructions", BEFORE "Project Structure".
- DO NOT add any steps, headings, or content after "Submission Guidelines".
- DO NOT add sections like "Conclusion", "Maintenance", "Future Improvements", or any other section not listed above.

Objective:
- Clearly and in detail explain the main goals of the assignment using the overridden technologies.
- Ensure students understand what they are building and what features are expected.

Technical Requirements:
- List ONLY technologies that are actually used in this project.
- If a category has no real technology to list, DO NOT write that category at all.
- DO NOT write "Not applicable", "N/A", "None", or any placeholder under any category.
- A category with no real content must be completely absent — not even the label.
- Frontend: include ONLY if a UI is being built. Use the overridden technology if provided.
- Backend: include ONLY if a server or API is explicitly required. Use the overridden technology if provided.
- Database: include ONLY if data persistence is explicitly required by the assignment.
- Optional/Bonus: include ONLY if bonus features are explicitly mentioned in the assignment.

Step-by-Step Instructions:
- Explain in detail the explanation of projects and features to be included in the project.
- Number all steps sequentially from Step 1 to Step N.
- Explain each step in clear, simple language with more detail.
- Include ALL steps here — setup, features, testing, deployment, documentation — everything.
- Each step must be actionable and specific.
- Include small code snippets only when they directly clarify a step. No full solutions.
- After the last step, do NOT add any more headings or content. Move directly to Project Structure.

Project Structure:
- Show the complete recommended folder/file layout inside a SINGLE fenced code block using tree format.

${timelineOverride ? `Timeline and Milestones:\n- Break the project into milestones using this timeline: ${timelineOverride}\n` : ""}

Submission Guidelines (FINAL SECTION — nothing comes after this):
- GitHub Repository Link – containing the complete project source code
- Published / Deployed Project Link – live application URL
- Screen Recording Link – a short video explaining the project, features, and code walkthrough


Assignment (read for feature scope only — ignore its technology stack):
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
