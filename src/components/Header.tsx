import React from "react";
import { GradeLevel } from "../types";
import { BookOpen, Sparkles, Wand2, Search, GraduationCap, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  selectedLevel: GradeLevel;
  onSelectLevel: (level: GradeLevel) => void;
  onOpenGenerator: () => void;
  onOpenAnalyzer: () => void;
  onOpenQuiz: () => void;
  activeView: "curriculum" | "lesson" | "analyzer" | "quiz";
  setActiveView: (view: "curriculum" | "lesson" | "analyzer" | "quiz") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  masteredCount: number;
}

const LEVELS: { level: GradeLevel; tag?: string }[] = [
  { level: "6ème" },
  { level: "5ème" },
  { level: "4ème" },
  { level: "3ème", tag: "BFEM" },
  { level: "2nde" },
  { level: "1ère", tag: "BAC 1" },
  { level: "Terminale", tag: "BAC" },
];

export const Header: React.FC<HeaderProps> = ({
  selectedLevel,
  onSelectLevel,
  onOpenGenerator,
  onOpenAnalyzer,
  onOpenQuiz,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  masteredCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-600/60 text-emerald-100 text-[11px] font-semibold tracking-wide uppercase border border-emerald-400/30">
              Sénégal 🇸🇳
            </span>
            <span className="text-emerald-100">
              Senegalese National English Syllabus • 6ème to Terminale (BFEM & BAC)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-flex items-center text-emerald-200 text-xs">
              <GraduationCap className="w-3.5 h-3.5 mr-1" />
              Aligned with BFEM & Baccalauréat English Examination Papers
            </span>
            {masteredCount > 0 && (
              <span className="inline-flex items-center bg-emerald-700/80 text-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                {masteredCount} {masteredCount > 1 ? "topics mastered" : "topic mastered"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <button
            onClick={() => setActiveView("curriculum")}
            className="flex items-center space-x-3 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold text-slate-900 tracking-tight">English</span>
                <span className="text-lg font-extrabold text-emerald-600">Senegal</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">National Syllabus & AI Grammar Generator</p>
            </div>
          </button>

          {/* Mobile generator button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenGenerator}
              className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              title="AI Lesson Generator"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search grammar topic (e.g. passive voice, reported speech, conditionals...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Tools */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveView("analyzer")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all ${
              activeView === "analyzer"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Sentence Coach</span>
          </button>

          <button
            onClick={() => setActiveView("quiz")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all ${
              activeView === "quiz"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grammar Quiz</span>
          </button>

          <button
            onClick={onOpenGenerator}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 flex items-center space-x-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate AI Lesson</span>
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">
              Classes :
            </span>
            {LEVELS.map(({ level, tag }) => {
              const isSelected = selectedLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => {
                    onSelectLevel(level);
                    if (activeView !== "curriculum") {
                      setActiveView("curriculum");
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? "bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-800"
                      : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
                  }`}
                >
                  <span>{level}</span>
                  {tag && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold uppercase ${
                        isSelected
                          ? "bg-amber-400 text-emerald-950"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
