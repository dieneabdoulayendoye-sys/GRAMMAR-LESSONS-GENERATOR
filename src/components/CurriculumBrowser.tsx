import React, { useState } from "react";
import { GradeLevel, GrammarDomain, SyllabusChapter } from "../types";
import { SYLLABUS_LEVELS } from "../data/syllabus";
import {
  BookOpen,
  Sparkles,
  CheckCircle,
  GraduationCap,
  Clock,
  ArrowRight,
  Filter,
  Flame,
  Award,
} from "lucide-react";

interface CurriculumBrowserProps {
  selectedLevel: GradeLevel;
  onSelectLevel: (level: GradeLevel) => void;
  onOpenLesson: (chapter: SyllabusChapter) => void;
  onGenerateSpecificLesson: (level: GradeLevel, topic: string) => void;
  searchQuery: string;
  masteredChapters: Set<string>;
  onToggleMastered: (chapterId: string) => void;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  selectedLevel,
  onOpenLesson,
  onGenerateSpecificLesson,
  searchQuery,
  masteredChapters,
  onToggleMastered,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("All");

  const currentLevelData = SYLLABUS_LEVELS.find((l) => l.level === selectedLevel) || SYLLABUS_LEVELS[0];

  // Extract unique domains for this level
  const domains = ["All", ...Array.from(new Set(currentLevelData.chapters.map((c) => c.domain)))];

  // Filter chapters
  const filteredChapters = currentLevelData.chapters.filter((chapter) => {
    const matchesDomain = selectedDomain === "All" || chapter.domain === selectedDomain;
    const matchesSearch =
      !searchQuery.trim() ||
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const levelMasteredCount = currentLevelData.chapters.filter((c) => masteredChapters.has(c.id)).length;
  const progressPercent = Math.round((levelMasteredCount / currentLevelData.chapters.length) * 100);

  return (
    <div className="space-y-6">
      {/* Level Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {currentLevelData.cycle}
            </span>
            {currentLevelData.examName && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Target Assessment: {currentLevelData.examName}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-serif">
            Senegalese National English Syllabus : Class of {selectedLevel}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {currentLevelData.description}
          </p>

          {/* Progress Tracker */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
            <div className="flex-1 max-w-xs bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center space-x-2 text-emerald-200 font-semibold">
              <span>{levelMasteredCount} of {currentLevelData.chapters.length} syllabus chapters mastered ({progressPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Domain Filters & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === domain
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0 self-end sm:self-center">
          {filteredChapters.length} {filteredChapters.length > 1 ? "chapters in syllabus" : "chapter in syllabus"}
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChapters.map((chapter, idx) => {
          const isMastered = masteredChapters.has(chapter.id);
          const isExamCrucial = chapter.importance === "Majeur (Examen)";

          return (
            <div
              key={chapter.id}
              className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                isMastered
                  ? "border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20"
                  : isExamCrucial
                  ? "border-amber-200/90 shadow-xs"
                  : "border-slate-200"
              }`}
            >
              {/* Top Chapter Tag & Domain */}
              <div className="p-5 pb-0">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Chapter {idx + 1}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {chapter.examRelevance && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          chapter.examRelevance === "BFEM"
                            ? "bg-amber-100 text-amber-900 border border-amber-300/50"
                            : chapter.examRelevance === "BAC"
                            ? "bg-teal-100 text-teal-900 border border-teal-300/50"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {chapter.examRelevance}
                      </span>
                    )}

                    <button
                      onClick={() => onToggleMastered(chapter.id)}
                      title={isMastered ? "Mark as need review" : "Mark as mastered"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isMastered
                          ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200"
                          : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  {chapter.domain}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                  {chapter.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {chapter.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-4 border-t border-slate-100 mt-4 bg-slate-50/50 flex flex-col gap-2">
                <button
                  onClick={() => onOpenLesson(chapter)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Full Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>

                <button
                  onClick={() => onGenerateSpecificLesson(selectedLevel, chapter.title)}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Generate AI In-Depth Lesson</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
