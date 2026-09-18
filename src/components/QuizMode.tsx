import React, { useState } from "react";
import { GradeLevel } from "../types";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  level: GradeLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  context: string;
}

const QUIZ_QUESTIONS: Question[] = [
  // 6ème
  {
    id: "q1",
    level: "6ème",
    question: "Choose the correct verb form for 3rd person singular in the Present Simple: 'Moussa [...] English at the middle school in Saint-Louis.'",
    options: ["teach", "teaches", "teaching", "is teach"],
    correctIndex: 1,
    explanation: "Verbs ending in -ch, -sh, -ss, -x, or -o take '-es' in the third person singular (he/she/it) of the Present Simple: 'teaches'.",
    context: "Present Simple 3rd Person Singular",
  },
  {
    id: "q2",
    level: "6ème",
    question: "Complete with the correct demonstrative pronoun: 'Look at [...] pirogues far away on the sea shore!'",
    options: ["this", "that", "these", "those"],
    correctIndex: 3,
    explanation: "'Pirogues' is plural, and 'far away' indicates distance, which requires the distal plural demonstrative 'those'.",
    context: "Demonstratives (This / That / These / Those)",
  },
  {
    id: "q3",
    level: "6ème",
    question: "Select the correct Wh- question word: '[...] does the ferry to Gorée Island depart? — At 10:00 AM.'",
    options: ["Where", "When", "Who", "Why"],
    correctIndex: 1,
    explanation: "'When' is used to ask for information about time, hours, or dates.",
    context: "Wh- Questions Formation",
  },

  // 5ème
  {
    id: "q4",
    level: "5ème",
    question: "Identify the correct irregular Past Simple form: 'Yesterday, the fishermen of Mbour [...] a huge quantity of fish.'",
    options: ["catched", "caught", "cought", "was catch"],
    correctIndex: 1,
    explanation: "'Catch' is an irregular verb whose past simple and past participle form is 'caught'.",
    context: "Past Simple Irregular Verbs",
  },
  {
    id: "q5",
    level: "5ème",
    question: "Choose the right past tense combination: 'While we [...] the wrestling combat on television, the electricity suddenly went out.'",
    options: ["watched", "were watching", "are watching", "have watched"],
    correctIndex: 1,
    explanation: "An ongoing background action in the past interrupted by a sudden short action ('the electricity went out') requires the Past Continuous ('were watching').",
    context: "Past Continuous vs Past Simple with While",
  },
  {
    id: "q6",
    level: "5ème",
    question: "Complete the comparative: 'Dakar is much [...] than Saint-Louis.'",
    options: ["crowded", "more crowded", "crowdeder", "most crowded"],
    correctIndex: 1,
    explanation: "'Crowded' is a two-syllable adjective; its comparative form is formed with 'more + adjective + than'.",
    context: "Comparative of Long Adjectives",
  },

  // 4ème
  {
    id: "q7",
    level: "4ème",
    question: "Eliminating French interference: 'Mr. Ndiaye has lived in Thiès [...] ten years.'",
    options: ["since", "for", "during", "ago"],
    correctIndex: 1,
    explanation: "Do not translate French 'depuis' as 'since' when expressing a total duration of time (ten years). A duration always requires 'for'.",
    context: "Present Perfect: Since vs For",
  },
  {
    id: "q8",
    level: "4ème",
    question: "Choose the correct Question Tag: 'You come from Casamance, [...]?'",
    options: ["don't you", "aren't you", "do you", "haven't you"],
    correctIndex: 0,
    explanation: "The main clause is affirmative in the Present Simple with an ordinary verb ('come'). The tag requires the auxiliary 'do' in the negative: 'don't you?'.",
    context: "Question Tags",
  },
  {
    id: "q9",
    level: "4ème",
    question: "First Conditional: 'If it [...] heavily this afternoon, we will cancel our football match.'",
    options: ["will rain", "rains", "rained", "raining"],
    correctIndex: 1,
    explanation: "In the First Conditional (If + Present Simple, will + base verb), the 'if'-clause NEVER takes 'will'. It must be in the Present Simple ('rains').",
    context: "First Conditional Rule",
  },

  // 3ème (BFEM)
  {
    id: "q10",
    level: "3ème",
    question: "BFEM Active to Passive: 'A famous Senegalese architect designed the monument.' — The monument [...] by a famous Senegalese architect.",
    options: ["was designed", "is designed", "were designed", "has designed"],
    correctIndex: 0,
    explanation: "The active verb 'designed' is in the Past Simple. 'The monument' is singular, so the passive requires 'was' + the past participle 'designed'.",
    context: "BFEM Passive Voice Transformation",
  },
  {
    id: "q11",
    level: "3ème",
    question: "BFEM Reported Speech: Direct: 'I will help you with your homework tonight,' Aminata told me. — Aminata told me that she [...] me with my homework that night.",
    options: ["will help", "would help", "would helped", "helps"],
    correctIndex: 1,
    explanation: "When reporting with a past reporting verb ('told'), 'will' backshifts to 'would', followed by the base verb 'help'. Also notice 'tonight' becomes 'that night'.",
    context: "BFEM Reported Speech Backshift",
  },
  {
    id: "q12",
    level: "3ème",
    question: "BFEM Conditional Type 2 (Hypothesis): 'If I [...] the President of the student council, I would organize an English club.'",
    options: ["am", "were", "will be", "have been"],
    correctIndex: 1,
    explanation: "In Conditional Type 2 (unreal present), the subjunctive form 'were' is used for all persons in formal English and national examinations.",
    context: "BFEM Conditional Type 2",
  },
  {
    id: "q13",
    level: "3ème",
    question: "BFEM Concession: '[...] the heavy downpour, the candidates arrived on time for the English paper.'",
    options: ["Although", "Despite", "Even though", "However"],
    correctIndex: 1,
    explanation: "'Despite' (or 'In spite of') is followed by a NOUN PHRASE ('the heavy downpour'), whereas 'Although' must be followed by a full subject + verb clause.",
    context: "BFEM Concession: Although vs Despite",
  },
  {
    id: "q14",
    level: "3ème",
    question: "Verb pattern: 'The students look forward to [...] Gorée Island next weekend.'",
    options: ["visit", "visiting", "visited", "to visit"],
    correctIndex: 1,
    explanation: "In the expression 'look forward to', 'to' is a preposition, not an infinitive marker. All prepositions in English are followed by the GERUND (-ing form).",
    context: "BFEM Gerund vs Infinitive",
  },

  // 2nde
  {
    id: "q15",
    level: "2nde",
    question: "Conditional Type 3 (Past Regret): 'If the driver had driven more carefully, the accident [...]'",
    options: [
      "would not happen",
      "would not have happened",
      "will not happen",
      "had not happened",
    ],
    correctIndex: 1,
    explanation: "Conditional Type 3 formula: If + Past Perfect ('had driven'), would have + Past Participle ('would not have happened').",
    context: "Conditional Type 3",
  },
  {
    id: "q16",
    level: "2nde",
    question: "Modal of Deduction: 'The sand is soaking wet all over the beach; it [...] rained heavily during the night.'",
    options: ["must have", "can't have", "should have", "might not have"],
    correctIndex: 0,
    explanation: "'Must have + past participle' expresses a logical past deduction with high certainty based on visible evidence.",
    context: "Past Modals of Deduction",
  },
  {
    id: "q17",
    level: "2nde",
    question: "Relative Clauses: 'Cheikh Anta Diop, [...] wrote monumental works on African civilization, was a brilliant polymath.'",
    options: ["who", "which", "whom", "whose"],
    correctIndex: 0,
    explanation: "'Who' is the subject relative pronoun referring to a person in a non-defining relative clause (separated by commas).",
    context: "Relative Pronouns in Apposition",
  },

  // 1ère
  {
    id: "q18",
    level: "1ère",
    question: "Inversion with negative adverbials: 'Hardly [...] the examination room when the invigilator told everyone to stop writing.'",
    options: [
      "the student had entered",
      "had the student entered",
      "did the student enter",
      "was the student entered",
    ],
    correctIndex: 1,
    explanation: "When 'Hardly', 'Scarcely', or 'Barely' begins a sentence, subject-auxiliary inversion is mandatory: Hardly + had + subject + past participle.",
    context: "Negative Inversion for Emphasis",
  },
  {
    id: "q19",
    level: "1ère",
    question: "The Causative Form: 'The school principal [...] before the start of the new academic term.'",
    options: [
      "had the classrooms painted",
      "painted the classrooms",
      "had painted the classrooms",
      "got the classrooms paint",
    ],
    correctIndex: 0,
    explanation: "The causative structure for arranged services is 'have + object + past participle' (had the classrooms painted).",
    context: "The Causative Form (Have something done)",
  },
  {
    id: "q20",
    level: "1ère",
    question: "Subjunctive Urgency: 'It is high time the international community [...] decisive action against desertification in the Sahel.'",
    options: ["takes", "took", "take", "has taken"],
    correctIndex: 1,
    explanation: "'It is high time + subject' requires the hypothetical past simple tense ('took') to express urgency.",
    context: "It is high time + Past Simple",
  },

  // Terminale (BAC)
  {
    id: "q21",
    level: "Terminale",
    question: "Senegalese BAC Rephrasing: Sentence A: 'If you don't revise your irregular verbs, you won't pass the English paper.' — Sentence B: 'Unless you [...] your irregular verbs, you won't pass the English paper.'",
    options: ["don't revise", "revise", "revises", "will revise"],
    correctIndex: 1,
    explanation: "'Unless' means 'If... not'. It already contains the negative meaning, so the verb that follows must be in the AFFIRMATIVE ('revise'). Using 'unless you don't' is a fatal double negative.",
    context: "BAC Rephrasing: Unless vs If not",
  },
  {
    id: "q22",
    level: "Terminale",
    question: "BAC Wish Clauses: 'I regret that I did not prepare thoroughly for the mock Baccalauréat.' — 'I wish I [...] thoroughly for the mock Baccalauréat.'",
    options: ["prepared", "had prepared", "would prepare", "have prepared"],
    correctIndex: 1,
    explanation: "To express a regret about a past event, 'wish' must be followed by the PAST PERFECT ('had prepared').",
    context: "BAC Expressing Past Regret with Wish",
  },
  {
    id: "q23",
    level: "Terminale",
    question: "BAC Inversion: 'Not only [...] the prestigious national prize, but she also earned a full university scholarship.'",
    options: ["she won", "did she win", "had she win", "was she won"],
    correctIndex: 1,
    explanation: "Sentence-initial 'Not only' triggers auxiliary inversion in the past: 'did' + subject ('she') + base verb ('win').",
    context: "BAC Inversion: Not only... but also",
  },
  {
    id: "q24",
    level: "Terminale",
    question: "BAC Error Detection: Which sentence contains a classic Francophone interference ERROR?",
    options: [
      "He has been living in Dakar for three years.",
      "He is living in Dakar since three years.",
      "He moved to Dakar three years ago.",
      "He arrived in Dakar in 2021.",
    ],
    correctIndex: 1,
    explanation: "'He is living in Dakar since three years' contains two major errors: (1) using Present Continuous instead of Present Perfect, and (2) using 'since' instead of 'for' before a duration.",
    context: "BAC Francophone Interference Eradication",
  },
];

export const QuizMode: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const filteredQuestions =
    selectedFilter === "All"
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter((q) => q.level === selectedFilter);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (_err) {}
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (score >= Math.floor(filteredQuestions.length * 0.7)) {
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch (_err) {}
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Formative Assessment & Exam Preparation</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
          Senegalese English Grammar Master Quiz
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Test your mastery of key grammar patterns, active-to-passive conversions, reported speech, and classic traps from BFEM & Baccalauréat English papers.
        </p>
      </div>

      {/* Level Filter */}
      {!isFinished && (
        <div className="flex items-center space-x-2 overflow-x-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 pl-2">Filter Level:</span>
          {["All", "6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedFilter(lvl);
                handleRestart();
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === lvl
                  ? "bg-emerald-800 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      )}

      {/* Quiz Card */}
      {!isFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold">
                  {currentQ.level}
                </span>
                <span>Question {currentIndex + 1} of {filteredQuestions.length}</span>
              </span>
              <span className="text-emerald-800 font-semibold">Score: {score} pt(s)</span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Topic: {currentQ.context}
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, optIdx) => {
              const isChosen = selectedOption === optIdx;
              const isCorrectOpt = optIdx === currentQ.correctIndex;

              let style = "bg-white border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-slate-50";
              if (isAnswered) {
                if (isCorrectOpt) {
                  style = "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-400/30";
                } else if (isChosen && !isCorrectOpt) {
                  style = "bg-red-50 border-red-300 text-red-900";
                } else {
                  style = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={optIdx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`p-4 text-left rounded-2xl border transition-all flex items-center justify-between text-xs sm:text-sm ${style}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {isAnswered && isChosen && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Callout */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                selectedOption === currentQ.correctIndex
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Official Examiner Explanation:</span>
              </div>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors shadow-sm"
              >
                <span>{currentIndex + 1 < filteredQuestions.length ? "Next Question" : "View Final Results"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              Quiz Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Here is your score on the Senegalese National English Syllabus quiz:
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto">
            <div className="text-3xl font-extrabold text-emerald-800">
              {score} / {filteredQuestions.length}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              {score >= Math.floor(filteredQuestions.length * 0.8)
                ? "🌟 Outstanding! Excellent mastery of English grammatical structures and exam standards!"
                : score >= Math.floor(filteredQuestions.length * 0.5)
                ? "👍 Good work! A few key areas to review before the BFEM / BAC exams."
                : "📚 Review the syllabus lessons to strengthen your foundational grammar rules."}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center space-x-2 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
