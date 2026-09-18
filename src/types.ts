export type GradeLevel = "6ème" | "5ème" | "4ème" | "3ème" | "2nde" | "1ère" | "Terminale";

export type GrammarDomain =
  | "Tenses & Verb Forms"
  | "Passive Voice & Agent"
  | "Reported Speech"
  | "Conditionals & Hypothesis"
  | "Modals & Auxiliaries"
  | "Nouns, Articles & Quantifiers"
  | "Relative Clauses & Pronouns"
  | "Link Words & Conjunctions"
  | "Sentence Structure & Inversion"
  | "Gerunds, Infinitives & Prepositions"
  | "BFEM & BAC Sentence Rephrasing";

export interface Exercise {
  id: string;
  type: "qcm" | "fill_gap" | "analysis";
  instruction: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  sentenceWithGap?: string;
  correctAnswer?: string;
  detailedExplanation: string;
  hint?: string;
}

export interface LessonSection {
  id: string;
  heading: string;
  content: string;
  keyRules?: string[];
  examples?: {
    phrase: string;
    explanation: string;
  }[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
}

export interface SenegaleseExamTips {
  examName: "BFEM (Brevet)" | "Baccalauréat Sénégalais" | "Évaluations Nationales";
  trapToAvoid: string;
  examinerSecret: string;
  examQuestionModel: string;
  modelAnswer: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  level: GradeLevel;
  domain: GrammarDomain;
  chapterNumber?: number;
  duration?: string;
  isAiGenerated?: boolean;
  objectives: string[];
  observationCorpus: {
    introduction: string;
    sentences: {
      text: string;
      author?: string;
      focusWords?: string;
    }[];
    analysisQuestions: string[];
  };
  lessonSections: LessonSection[];
  senegaleseExamTips: SenegaleseExamTips;
  summaryMemo: {
    catchphrase: string;
    bullets: string[];
  };
  interactiveExercises: Exercise[];
}

export interface SyllabusChapter {
  id: string;
  title: string;
  domain: GrammarDomain;
  description: string;
  importance: "Essentiel" | "Majeur (Examen)" | "Avancé";
  examRelevance?: "BFEM" | "BAC" | "Contrôle continu";
  defaultLesson?: Lesson;
}

export interface SyllabusLevel {
  level: GradeLevel;
  cycle: "Cycle Moyen (Collège)" | "Cycle Secondaire (Lycée)";
  description: string;
  examName?: string;
  chapters: SyllabusChapter[];
}

export interface SentenceAnalysisResult {
  sentence: string;
  typeAndForm: {
    type: string;
    form: string;
    structure: string;
  };
  propositions: {
    text: string;
    nature: string;
    function: string;
    connective?: string;
  }[];
  wordsAnalysis: {
    segment: string;
    nature: string;
    function: string;
    pedagogicalNote?: string;
  }[];
  senegaleseExamFeedback: string;
}
