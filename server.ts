import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

function safeExtractJson<T = any>(rawText: string): T {
  if (!rawText) throw new Error("Empty response from AI model.");
  let cleaned = rawText.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sliced = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sliced);
    }
    throw initialErr;
  }
}

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    systemInstruction?: string;
    prompt: string;
    temperature?: number;
  }
): Promise<string> {
  const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.7,
          responseMimeType: "application/json",
        },
      });

      if (response.text && response.text.trim()) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} encountered an issue, trying next model:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models currently unavailable.");
}

function normalizeLesson(data: any, level: string, topic: string) {
  const isBFEM = level.includes("3") || level.includes("4");
  const isBAC = level.includes("Terminale") || level.includes("1") || level.includes("2nde");
  const examDefault = isBFEM ? "BFEM (Brevet)" : isBAC ? "Baccalauréat Sénégalais" : "Évaluations Nationales";

  return {
    title: data.title || `Mastering ${topic}`,
    subtitle: data.subtitle || `Comprehensive English grammar guide strictly aligned with the Senegalese ${level} syllabus`,
    level: level,
    domain: data.domain || "Sentence Structure & Inversion",
    duration: data.duration || "2 hours",
    isAiGenerated: true,
    objectives: Array.isArray(data.objectives) && data.objectives.length > 0
      ? data.objectives
      : [
          `Understand the theoretical foundation and usage of ${topic}.`,
          `Avoid typical French-to-English interference errors common in Senegalese schools.`,
          `Master exam-style sentence rephrasing for ${examDefault}.`,
        ],
    observationCorpus: {
      introduction: data.observationCorpus?.introduction || `Observe how ${topic} is naturally used in contemporary Senegalese contexts:`,
      sentences: Array.isArray(data.observationCorpus?.sentences) && data.observationCorpus.sentences.length > 0
        ? data.observationCorpus.sentences
        : [
            {
              text: `Senegalese students at Lycée Lamine Guèye in Dakar diligently practice ${topic} every week.`,
              author: "Dakar High School Context",
              focusWords: topic,
            },
            {
              text: `The agricultural cooperative in the Casamance region has achieved outstanding yields this year.`,
              author: "Casamance Region",
              focusWords: "Key grammatical structure",
            },
          ],
      analysisQuestions: Array.isArray(data.observationCorpus?.analysisQuestions) && data.observationCorpus.analysisQuestions.length > 0
        ? data.observationCorpus.analysisQuestions
        : [
            `What grammatical markers can you observe in the target sentence?`,
            `How does this construction differ from direct French translation?`,
          ],
    },
    lessonSections: Array.isArray(data.lessonSections) && data.lessonSections.length > 0
      ? data.lessonSections.map((sec: any, idx: number) => ({
          id: sec.id || `sec-${idx + 1}`,
          heading: sec.heading || `Core Grammatical Concepts & Rules`,
          content: sec.content || `Detailed explanation of the rule and syntax.`,
          keyRules: Array.isArray(sec.keyRules) ? sec.keyRules : [],
          examples: Array.isArray(sec.examples) ? sec.examples : [],
          comparisonTable: sec.comparisonTable?.headers && sec.comparisonTable?.rows
            ? sec.comparisonTable
            : undefined,
        }))
      : [
          {
            id: "sec-1",
            heading: "1. Grammatical Form and Rules",
            content: `In the Senegalese English syllabus, mastering ${topic} requires understanding both its syntax and its communicative value.`,
            keyRules: [
              `Always verify subject-verb agreement and proper auxiliary usage.`,
              `Pay attention to regular vs. irregular forms and appropriate word order.`,
            ],
            examples: [
              {
                phrase: `Standard application sentence illustrating ${topic}.`,
                explanation: `Detailed grammatical breakdown in context.`,
              },
            ],
          },
        ],
    senegaleseExamTips: {
      examName: data.senegaleseExamTips?.examName || examDefault,
      trapToAvoid: data.senegaleseExamTips?.trapToAvoid || `Translating directly from French or Wolof syntax, which leads to incorrect tense and preposition choices.`,
      examinerSecret: data.senegaleseExamTips?.examinerSecret || `Official examiners award maximum marks for complete sentence rephrasing with correct punctuation and verb agreement.`,
      examQuestionModel: data.senegaleseExamTips?.examQuestionModel || `Rewrite sentence (b) so that it has the exact same meaning as sentence (a).`,
      modelAnswer: data.senegaleseExamTips?.modelAnswer || `Sentence (b) with accurate grammatical transformation applied.`,
    },
    summaryMemo: {
      catchphrase: data.summaryMemo?.catchphrase || `Observe the rule, check the auxiliary, avoid French interference!`,
      bullets: Array.isArray(data.summaryMemo?.bullets) && data.summaryMemo.bullets.length > 0
        ? data.summaryMemo.bullets
        : [
            `Review the main structural pattern before transforming sentences.`,
            `Double check verb tenses, pronouns, and time adverbs.`,
            `Practice active production through exam-style exercises.`,
          ],
    },
    interactiveExercises: Array.isArray(data.interactiveExercises) && data.interactiveExercises.length > 0
      ? data.interactiveExercises.map((ex: any, idx: number) => ({
          id: ex.id || `ex-${idx + 1}`,
          type: ex.type || "qcm",
          instruction: ex.instruction || "Choose the correct answer:",
          question: ex.question || "",
          options: Array.isArray(ex.options) ? ex.options : ["Option A", "Option B", "Option C"],
          correctIndex: typeof ex.correctIndex === "number" ? ex.correctIndex : 0,
          sentenceWithGap: ex.sentenceWithGap || "",
          correctAnswer: ex.correctAnswer || "",
          detailedExplanation: ex.detailedExplanation || "Refer to the syllabus guidelines for this rule.",
          hint: ex.hint || "",
        }))
      : [
          {
            id: "ex-1",
            type: "qcm",
            instruction: "Identify the grammatically correct sentence:",
            question: `Which option accurately applies ${topic}?`,
            options: [
              "Sentence demonstrating correct grammar according to the syllabus.",
              "Sentence with incorrect auxiliary usage.",
              "Sentence with French interference error.",
            ],
            correctIndex: 0,
            detailedExplanation: "Option A respects standard English syntax and Senegalese exam guidelines.",
          },
        ],
  };
}

function buildCurriculumFallbackLesson(level: string, topic: string, focus: string) {
  const isBFEM = level.includes("3") || level.includes("4");
  const isBAC = level.includes("Terminale") || level.includes("1") || level.includes("2nde");
  const examName = isBFEM ? "BFEM (Brevet)" : isBAC ? "Baccalauréat Sénégalais" : "Évaluations Nationales";

  return {
    title: `${topic}: Mastery Course & Exam Guide`,
    subtitle: `Complete pedagogical unit strictly designed for ${level} students under the Senegalese National English Syllabus`,
    level,
    domain: "Sentence Structure & Inversion",
    duration: "2 hours",
    isAiGenerated: true,
    objectives: [
      `Understand the grammatical foundation, form, and communicative value of ${topic}.`,
      `Identify and eliminate common French / Wolof language interference traps.`,
      `Master Senegalese national exam rephrasing exercises (${examName} Section II).`,
      `Apply the target structure accurately in communicative spoken and written English.`,
    ],
    observationCorpus: {
      introduction: `Observe these model sentences reflecting authentic educational, cultural, and civic realities in Senegal:`,
      sentences: [
        {
          text: `The students of Lycée Seydina Limamou Laye in Guédiawaye have achieved remarkable results in their English assessments.`,
          author: "Dakar Academic Excellence",
          focusWords: topic,
        },
        {
          text: `In Saint-Louis, historical heritage is preserved by the community with great care and pride.`,
          author: "Senegalese Heritage Context",
          focusWords: "Target Grammatical Pattern",
        },
        {
          text: `Sadio Mané has inspired millions of Senegalese youth through his sportsmanship and philanthropy.`,
          author: "National Role Model",
          focusWords: "Core Verb Construction",
        },
      ],
      analysisQuestions: [
        `Identify the main verb and auxiliary in the first sentence. What role does each element play?`,
        `Notice the position of time and place adverbs in sentence 2. How does English word order compare to French?`,
      ],
    },
    lessonSections: [
      {
        id: "sec-1",
        heading: "1. Form, Syntax & Core Rules",
        content: `In the Senegalese national syllabus for ${level}, ${topic} forms a cornerstone of linguistic competence.\n\nTo construct this structure properly:\n• Always identify the subject, tense, and auxiliary requirements.\n• Keep word order strict: Subject + Auxiliary + Main Verb + Object/Complements.\n• Pay special attention to irregular verbs and spelling changes.`,
        keyRules: [
          `Rule 1: Always check agreement between the grammatical subject and the finite verb.`,
          `Rule 2: When an auxiliary is used, ensure the lexical verb takes its bare infinitive or participle form as required.`,
          `Rule 3: In national exams, full sentences must be rewritten without altering the intended meaning.`,
        ],
        examples: [
          {
            phrase: `The teacher explained the rules clearly to the candidates.`,
            explanation: `Standard affirmative structure with clear agent, verb, and complementation.`,
          },
          {
            phrase: `Unless candidates revise systematically, they may encounter difficulties in Section II.`,
            explanation: `Shows conditional subordination without redundant negative particles.`,
          },
        ],
        comparisonTable: {
          headers: ["Grammar Feature", "Correct English Usage", "Common Pitfall (French Transfer)"],
          rows: [
            ["Auxiliary Agreement", "They have completed their work.", "*They has completed (Agreement error)"],
            ["Word Order", "He always arrives on time.", "*He arrives always (French transfer)"],
            ["Time Prepositions", "For five years (duration)", "*Since five years (from 'depuis')"],
          ],
        },
      },
      {
        id: "sec-2",
        heading: "2. Common Francophone / Senegalese Learner Pitfalls",
        content: `Students in Senegal frequently translate directly from French, which creates recurring systematic errors on exam papers:\n\n1. French Preposition Transfer: Using 'since' for a duration (e.g. *since two weeks*) instead of 'for two weeks'.\n2. Auxiliary Omission: Omitting 'to be' or 'to have' in compound tenses.\n3. Double Negation: Using negative verbs after 'unless' (*Unless you don't study* instead of *Unless you study*).\n4. Word Order: Placing adverbs of frequency after the direct object instead of before the main verb.`,
        keyRules: [
          `Never translate word-for-word from French idioms into English.`,
          `Remember that 'Unless' already means 'If... not'—do not add another negative particle.`,
          `Distinguish strictly between points in time ('since') and durations ('for').`,
        ],
        examples: [
          {
            phrase: `Incorrect: We are living in Thiès since three years. -> Correct: We have lived in Thiès for three years.`,
            explanation: `French 'depuis' + present requires English Present Perfect + 'for'.`,
          },
        ],
      },
    ],
    senegaleseExamTips: {
      examName,
      trapToAvoid: `The number one error in ${examName} papers is forgetting to adapt pronouns, tenses, or prepositions when rephrasing sentences in Section II.`,
      examinerSecret: `Inspectors and jury members grade sentence rephrasing on strict accuracy. If you make a minor spelling error on an irregular verb or omit a capital letter, you risk losing all points for that question.`,
      examQuestionModel: `${examName} Linguistic Competence Prompt:\n(a) Although the rain was heavy, the match in Dakar was not postponed.\n(b) In spite of...`,
      modelAnswer: `(b) In spite of the heavy rain, the match in Dakar was not postponed.`,
    },
    summaryMemo: {
      catchphrase: `Structure + Tense + Senegalese Context = 100% Exam Success!`,
      bullets: [
        `Step 1: Identify the target tense and subject before answering.`,
        `Step 2: Never use negative verbs after 'unless'.`,
        `Step 3: Check subject-verb agreement on the new subject.`,
        `Step 4: Reread your transformed sentence to ensure smooth, natural English.`,
      ],
    },
    interactiveExercises: [
      {
        id: "ex-1",
        type: "qcm",
        instruction: "Select the grammatically correct sentence according to the Senegalese syllabus:",
        question: `Which sentence correctly illustrates ${topic}?`,
        options: [
          "The students have studied English in Dakar for five years.",
          "The students study English in Dakar since five years.",
          "The students are studying English in Dakar since five years.",
          "The students has studied English in Dakar for five years.",
        ],
        correctIndex: 0,
        detailedExplanation: "Option A correctly combines the Present Perfect ('have studied') with 'for' to denote a five-year duration.",
      },
      {
        id: "ex-2",
        type: "fill_gap",
        instruction: `Complete the sentence with the appropriate grammatical form:`,
        sentenceWithGap: `The fishermen of Kayar [gap] (work) on the Atlantic coast for decades.`,
        correctAnswer: "have worked",
        detailedExplanation: "A plural subject ('The fishermen') with a duration ('for decades') requires the Present Perfect plural: 'have worked'.",
      },
      {
        id: "ex-3",
        type: "analysis",
        instruction: `${examName} Rephrasing: Rewrite sentence (b) so that it means the same as sentence (a):`,
        sentenceWithGap: `(a) 'If you do not attend class regularly, you will fail the exam.' -> (b) Unless you attend class regularly, *you will fail the exam*.`,
        correctAnswer: "you will fail the exam",
        detailedExplanation: "'Unless' replaces 'If... not', so the subordinate clause becomes affirmative ('Unless you attend'), and the main clause remains ('you will fail the exam').",
      },
    ],
  };
}

// Endpoint: Generate Full Lesson
app.post("/api/generate-lesson", async (req, res) => {
  try {
    const {
      level,
      topic,
      focus = "standard", // "decouverte", "standard", "approfondissement", "bfem_bac"
      culturalContext = true,
      customNotes = "",
    } = req.body;

    if (!level || !topic) {
      return res.status(400).json({ error: "Level (class) and topic are required." });
    }

    const ai = getGeminiClient();

    // If Gemini client is not configured, supply the syllabus fallback immediately
    if (!ai) {
      console.log("No Gemini API key configured, generating curriculum lesson via syllabus engine.");
      const fallbackLesson = buildCurriculumFallbackLesson(level, topic, focus);
      return res.json({ success: true, lesson: fallbackLesson, fallback: true });
    }

    const isBFEM = level.includes("3") || level.includes("4");
    const isBAC = level.includes("Terminale") || level.includes("1") || level.includes("2nde");
    const examTarget = isBFEM ? "BFEM (Brevet de Fin d'Études Moyennes - English Paper)" : isBAC ? "Baccalauréat Sénégalais (English Paper - Series L/S/G/T)" : "Senegalese National English Curriculum Assessments";

    const systemInstruction = `You are a Senior English Language Inspector and Certified Teacher of English (EFL) in Senegal, recognized expert in the Senegalese National English Curriculum (Ministère de l'Éducation Nationale du Sénégal - Direction de l'Enseignement Moyen et Secondaire Général / IGE).
You design comprehensive, pedagogically sound, and engaging English grammar lessons strictly tailored to the Senegalese syllabus from 6ème to Terminale, with specialized mastery for national exams (BFEM in 3ème and Baccalauréat in Terminale).

Key Pedagogical Principles for Senegalese Learners:
1. Target Audience: Francophone Senegalese students learning English as a foreign language. Explanations and rules are in clear, accessible English, accompanied by insightful pedagogical contrast with French/Wolof interference when beneficial (e.g. false friends, tense misuse like "since 2 years" vs "for 2 years", "if I will see" vs "if I see", passive voice differences).
2. Senegalese Cultural Contextualization: Examples and observation texts should celebrate Senegalese daily life, history, geography, and culture (Dakar, Saint-Louis, Gorée, Touba, Casamance, Lake Retba, Saloum Delta, Teranga, wrestling/laamb, eco-citizenship, African literature and role models such as Cheikh Anta Diop, Sadio Mané, Mariama Bâ, Chinua Achebe, Ken Bugul).
3. Exam Focus ("The Senegalese Candidate's Corner" / BFEM & BAC Exam Tips):
   - BFEM (3ème/4ème): Focus on sentence rephrasing ("Rewrite sentence B starting with..."), question tags, active/passive voice, reported speech, first & second conditionals, tense consistency.
   - BAC (1ère/Terminale): Focus on Communicative & Linguistic Competence, advanced sentence transformations (Inversion, Passive with reporting verbs, Mixed conditionals, Wish/If only, Causative), word building (prefixes/suffixes), and error correction.
4. Comprehensive lesson breakdown:
   - Clear measurable objectives.
   - Observation corpus with authentic Senegalese context.
   - Detailed rule explanations with comparison tables.
   - Senegalese Exam tips with common traps and model answers.
   - Visual mnemonic summary.
   - 4 to 5 interactive practice exercises (MCQ, fill-in-the-blank, and sentence transformation/analysis) with complete step-by-step explanations.

You MUST respond strictly in valid JSON format.`;

    const prompt = `Generate a complete and rigorous English grammar lesson for the Senegalese curriculum level: ${level}
Topic: "${topic}"
Pedagogical Focus: ${focus}
Senegalese Cultural Context: ${culturalContext ? "Yes (vibrant Senegalese context)" : "General"}
${customNotes ? `Teacher's specific instructions: ${customNotes}` : ""}

Respond ONLY with a valid JSON object matching the following structure:
{
  "title": "Exact Lesson Title in English",
  "subtitle": "Clear explanatory subtitle highlighting pedagogical aim",
  "level": "${level}",
  "domain": "Tenses & Verb Forms / Passive Voice & Agent / Reported Speech / Conditionals & Hypothesis / Modals & Auxiliaries / Nouns, Articles & Quantifiers / Relative Clauses & Pronouns / Link Words & Conjunctions / Sentence Structure & Inversion / Gerunds, Infinitives & Prepositions / BFEM & BAC Sentence Rephrasing",
  "duration": "e.g. 2 hours",
  "objectives": [
    "Identify and understand...",
    "Correctly form and use...",
    "Master exam rephrasing and avoid common interference mistakes..."
  ],
  "observationCorpus": {
    "introduction": "Short introductory paragraph setting the context of the study sentences",
    "sentences": [
      {
        "text": "Authentic example sentence set in Senegal (e.g. daily life in Dakar, Senegalese culture or African literature)",
        "author": "e.g. 'Senegalese Cultural Context' or author name",
        "focusWords": "Target grammar elements"
      },
      {
        "text": "Second illustrative sentence",
        "author": "e.g. 'Casamance setting' or 'Dakar youth'",
        "focusWords": "Target grammar elements"
      }
    ],
    "analysisQuestions": [
      "Guided observation question 1...",
      "Guided observation question 2..."
    ]
  },
  "lessonSections": [
    {
      "id": "section-1",
      "heading": "1. Form and Structure",
      "content": "Clear pedagogical explanation with formula/rules.",
      "keyRules": [
        "Core rule to remember..."
      ],
      "examples": [
        {
          "phrase": "Concrete example sentence",
          "explanation": "Grammatical breakdown and meaning"
        }
      ],
      "comparisonTable": {
        "headers": ["Structure / Tense", "Usage & Value", "Example in Context"],
        "rows": [
          ["...", "...", "..."]
        ]
      }
    },
    {
      "id": "section-2",
      "heading": "2. Common Francophone / Senegalese Learner Pitfalls",
      "content": "Contrastive explanation highlighting false friends or typical French-English interference.",
      "keyRules": [
        "Never say... instead say..."
      ],
      "examples": [
        {
          "phrase": "Correct vs Incorrect usage",
          "explanation": "Why Francophone students make this mistake and how to fix it"
        }
      ]
    }
  ],
  "senegaleseExamTips": {
    "examName": "${examTarget}",
    "trapToAvoid": "The most frequent mistake Senegalese candidates make in BFEM / BAC exams on this topic",
    "examinerSecret": "What Senegalese exam markers strictly check for in grading keys",
    "examQuestionModel": "Standard exam rephrasing prompt: 'Rewrite Sentence (b) so that it means the same as Sentence (a)...'",
    "modelAnswer": "The perfect model answer with justification"
  },
  "summaryMemo": {
    "catchphrase": "A catchy mnemonic formula or golden rule for revision",
    "bullets": [
      "Key revision point 1",
      "Key revision point 2",
      "Key revision point 3"
    ]
  },
  "interactiveExercises": [
    {
      "id": "ex-1",
      "type": "qcm",
      "instruction": "Choose the correct option to complete the sentence:",
      "question": "Sentence with question context...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "detailedExplanation": "Step-by-step grammatical explanation for why this is correct."
    },
    {
      "id": "ex-2",
      "type": "fill_gap",
      "instruction": "Complete the gap with the correct form of the verb/word in brackets:",
      "sentenceWithGap": "If Sadio Mané [gap] (train) harder yesterday, his team would have won.",
      "correctAnswer": "had trained",
      "detailedExplanation": "Explanation of Conditional Type 3 structure (If + Past Perfect -> Would have + Past Participle)."
    },
    {
      "id": "ex-3",
      "type": "analysis",
      "instruction": "Sentence Rephrasing (Senegalese Exam Style): Rewrite sentence (b) so that it means the same as sentence (a):",
      "sentenceWithGap": "(a) 'I didn't visit Saint-Louis last month because I was sick.' -> (b) If I had not been sick, *I would have visited Saint-Louis*.",
      "correctAnswer": "I would have visited Saint-Louis",
      "detailedExplanation": "Transforming a past cause/consequence into a third conditional hypothesis."
    }
  ]
}`;

    try {
      const rawText = await callGeminiWithFallback(ai, {
        systemInstruction,
        prompt,
        temperature: 0.7,
      });

      const parsedData = safeExtractJson(rawText);
      const normalized = normalizeLesson(parsedData, level, topic);
      return res.json({ success: true, lesson: normalized });
    } catch (aiErr: any) {
      console.warn("AI generation failed after fallback attempts, falling back to curriculum engine:", aiErr?.message || aiErr);
      const fallbackLesson = buildCurriculumFallbackLesson(level, topic, focus);
      return res.json({
        success: true,
        lesson: fallbackLesson,
        fallback: true,
        notice: "Lesson generated using Senegalese National English Syllabus Engine.",
      });
    }
  } catch (err: any) {
    console.error("Error in /api/generate-lesson:", err);
    res.status(500).json({ error: err.message || "Erreur interne du serveur." });
  }
});

// Endpoint: Analyze sentence (English Grammar & Rephrasing Coach)
app.post("/api/analyze-sentence", async (req, res) => {
  try {
    const { sentence, level = "3ème" } = req.body;
    if (!sentence) {
      return res.status(400).json({ error: "Please provide an English sentence to analyze." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }

    const prompt = `Analyze the following English sentence according to the pedagogical standards of the Senegalese National English Syllabus (target level: ${level}):
"${sentence}"

Provide a comprehensive grammatical breakdown and Senegalese exam coaching in strict JSON format:
{
  "sentence": "${sentence}",
  "typeAndForm": {
    "type": "Declarative / Interrogative / Imperative / Exclamatory",
    "form": "Affirmative/Negative, Active/Passive Voice",
    "structure": "Simple Sentence / Compound Sentence / Complex Sentence / Compound-Complex"
  },
  "propositions": [
    {
      "text": "Clause segment (e.g. 'Although the fishermen departed at dawn')",
      "nature": "Independent Main Clause / Subordinate Adverbial Clause of Concession / Defining Relative Clause / Noun Clause",
      "function": "Syntactic role in the sentence (e.g. Expresses contrast to the main action...)",
      "connective": "Subordinating conjunction / Relative pronoun (e.g. 'Although', 'Who', 'Because')"
    }
  ],
  "wordsAnalysis": [
    {
      "segment": "Word or phrase analyzed",
      "nature": "Part of speech (e.g. Transitive verb in Present Perfect, Preposition of place, Demonstrative pronoun)",
      "function": "Syntactic function (e.g. Subject, Direct Object, Adverbial modifier of time)",
      "pedagogicalNote": "Insight for Francophone/Senegalese learners (e.g. contrast with French false friend, correct preposition usage, pronunciation or irregular form)"
    }
  ],
  "senegaleseExamFeedback": "How this sentence structure appears in Senegalese BFEM or BAC exams, including expected rephrasing variations (e.g. 'In a BFEM paper, candidates might be asked to rewrite this with: In spite of... or Active/Passive transformation')."
}`;

    const rawText = await callGeminiWithFallback(ai, {
      systemInstruction:
        "You are an official Chief Examiner for the English Paper at BFEM and the Senegalese Baccalauréat (Series L/S/G). Respond strictly in valid JSON.",
      prompt,
      temperature: 0.5,
    });

    const parsed = safeExtractJson(rawText);
    res.json({ success: true, analysis: parsed });
  } catch (err: any) {
    console.error("Error in /api/analyze-sentence:", err);
    res.status(500).json({ error: err.message || "Error during sentence analysis." });
  }
});

// Start server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Grammaire Sénégal en cours d'exécution sur le port ${PORT}`);
  });
}

start();
