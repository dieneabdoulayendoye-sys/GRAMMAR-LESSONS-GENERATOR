import React, { useState, useEffect } from "react";
import { GradeLevel, Lesson } from "../types";
import { SYLLABUS_LEVELS } from "../data/syllabus";
import {
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";

interface LessonGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: GradeLevel;
  defaultTopic?: string;
  onLessonGenerated: (lesson: Lesson) => void;
}

const CULTURAL_TIPS = [
  "In Senegal, Section II (Linguistic & Communicative Competence) in BFEM and BAC English papers accounts for vital points with Sentence Rephrasing.",
  "Classic Senegalese student trap: Translating 'depuis 3 ans' as 'since 3 years' instead of 'for 3 years'.",
  "BFEM Secret: In Reported Speech, examiners check three things: tense backshift, pronoun shifts, and time markers (tomorrow -> the next day).",
  "BAC Inversion Rule: Negative adverbs at the beginning of sentences (Hardly, Seldom, Not only) require immediate subject-auxiliary inversion.",
  "Wolof proverb: 'Ndank-ndank mooy jàpp golo ci ñaay' (Patience and diligence lead to mastery). Consistent English practice ensures academic excellence!",
];

export const LessonGeneratorModal: React.FC<LessonGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultLevel = "3ème",
  defaultTopic = "",
  onLessonGenerated,
}) => {
  const [level, setLevel] = useState<GradeLevel>(defaultLevel);
  const [topic, setTopic] = useState<string>(defaultTopic);
  const [focus, setFocus] = useState<string>("bfem_bac");
  const [culturalContext, setCulturalContext] = useState<boolean>(true);
  const [customNotes, setCustomNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState<number>(0);

  useEffect(() => {
    if (defaultLevel) setLevel(defaultLevel);
    if (defaultTopic) setTopic(defaultTopic);
  }, [defaultLevel, defaultTopic]);

  // Rotate tips while loading
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CULTURAL_TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const currentLevelSyllabus = SYLLABUS_LEVELS.find((l) => l.level === level);
  const suggestedChapters = currentLevelSyllabus ? currentLevelSyllabus.chapters : [];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please select or enter an English grammar lesson topic.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          topic,
          focus,
          culturalContext,
          customNotes,
        }),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (_jsonErr) {
        throw new Error("Network or server returned an invalid response. Please try again.");
      }

      if (!response.ok || !data.success || !data.lesson) {
        throw new Error(data?.error || "Failed to generate English lesson. Please try again.");
      }

      const newLesson: Lesson = {
        ...data.lesson,
        id: data.lesson.id || `ai-lesson-${Date.now()}`,
        level: data.lesson.level || level,
        isAiGenerated: true,
      };

      onLessonGenerated(newLesson);
      onClose();
    } catch (err: any) {
      console.error("Lesson generation error:", err);
      setError(err.message || "An error occurred while communicating with the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Specialized English Syllabus AI Engine</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            Generate Full English Grammar Lesson
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Aligned with the Senegalese National English Syllabus (DEMSG), with BFEM/BAC tips and interactive exercises.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {error}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Senior Inspector AI is drafting your lesson...
                </h3>
                <p className="text-xs text-slate-500">
                  Calibrating syllabus objectives for {level}, integrating Senegalese cultural examples, formulating rules, and generating targeted exercises with answer keys.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-serif italic max-w-lg mx-auto">
                💡 {CULTURAL_TIPS[tipIndex]}
              </div>
            </div>
          ) : (
            <>
              {/* Class Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Select School Grade Level:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {(["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"] as GradeLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setLevel(lvl);
                        setTopic("");
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                        level === lvl
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selector / Custom Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  2. English Grammar Topic:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Passive voice transformation, Reported speech questions, Conditionals Type 2 and 3..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />

                {/* Quick suggestions from the official syllabus */}
                {suggestedChapters.length > 0 && (
                  <div className="mt-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Official syllabus topics for {level}:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {suggestedChapters.map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setTopic(ch.title)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors text-left ${
                            topic === ch.title
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {ch.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pedagogical focus */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Pedagogical Orientation:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "bfem_bac", title: "National Exam Special (BFEM / BAC)", desc: "Focus on rephrasing, examiner secrets & frequent pitfalls" },
                    { id: "standard", title: "Comprehensive Reference Lesson", desc: "Perfect balance of theory, formulas and practice exercises" },
                    { id: "decouverte", title: "Foundations & Step-by-Step Discovery", desc: "Gentle progression ideal for beginners and reinforcement" },
                    { id: "approfondissement", title: "Advanced Mastery & Stylistics", desc: "Complex structures, inversion, and nuances" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFocus(f.id)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        focus === f.id
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-300"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-bold">{f.title}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={culturalContext}
                    onChange={(e) => setCulturalContext(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Strong Senegalese Cultural Context (Dakar, Casamance, Saint-Louis, Teranga, local literature & sports)
                  </span>
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Specific Instructions or Examiner Requests (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Include active-to-passive rephrasing with modals, highlight 'unless' traps..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isLoading && (
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-700/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Full English Lesson</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
