/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GradeLevel, Lesson, SyllabusChapter } from "./types";
import { FEATURED_LESSONS } from "./data/syllabus";
import { Header } from "./components/Header";
import { CurriculumBrowser } from "./components/CurriculumBrowser";
import { LessonViewer } from "./components/LessonViewer";
import { LessonGeneratorModal } from "./components/LessonGeneratorModal";
import { SentenceAnalyzer } from "./components/SentenceAnalyzer";
import { QuizMode } from "./components/QuizMode";

export default function App() {
  const [activeView, setActiveView] = useState<"curriculum" | "lesson" | "analyzer" | "quiz">("curriculum");
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel>("3ème");
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(FEATURED_LESSONS["3e-ch1"]);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [generatorLevel, setGeneratorLevel] = useState<GradeLevel>("3ème");
  const [generatorTopic, setGeneratorTopic] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [masteredChapterIds, setMasteredChapterIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sn_grammar_mastered_chapters");
      return saved ? JSON.parse(saved) : ["6e-ch1", "3e-ch1"];
    } catch {
      return ["6e-ch1", "3e-ch1"];
    }
  });

  // Save mastered chapters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sn_grammar_mastered_chapters", JSON.stringify(masteredChapterIds));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [masteredChapterIds]);

  const handleToggleMastered = (chapterId: string) => {
    setMasteredChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    );
  };

  const handleSelectChapter = (chapter: SyllabusChapter) => {
    // Check if we have an instant pre-loaded flagship lesson
    const preloaded = FEATURED_LESSONS[chapter.id];
    if (preloaded) {
      setCurrentLesson(preloaded);
      setActiveView("lesson");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Launch the AI generator modal with the specific chapter context
      setGeneratorLevel(selectedLevel);
      setGeneratorTopic(chapter.title);
      setIsGeneratorOpen(true);
    }
  };

  const handleLessonGenerated = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSelectedLevel(lesson.level);
    setActiveView("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenGenerator = (lvl?: GradeLevel, topic?: string) => {
    setGeneratorLevel(lvl || selectedLevel);
    setGeneratorTopic(topic || "");
    setIsGeneratorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Global Header */}
      <Header
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onOpenGenerator={() => handleOpenGenerator()}
        onOpenAnalyzer={() => {
          setActiveView("analyzer");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenQuiz={() => {
          setActiveView("quiz");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        masteredCount={masteredChapterIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === "curriculum" && (
          <CurriculumBrowser
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            onOpenLesson={handleSelectChapter}
            onGenerateSpecificLesson={(lvl, topic) => handleOpenGenerator(lvl, topic)}
            searchQuery={searchQuery}
            masteredChapters={new Set(masteredChapterIds)}
            onToggleMastered={handleToggleMastered}
          />
        )}

        {activeView === "lesson" && currentLesson && (
          <LessonViewer
            lesson={currentLesson}
            onBack={() => setActiveView("curriculum")}
            onRegenerate={() => handleOpenGenerator(currentLesson.level, currentLesson.title)}
            isMastered={masteredChapterIds.includes(currentLesson.id)}
            onToggleMastered={() => handleToggleMastered(currentLesson.id)}
          />
        )}

        {activeView === "analyzer" && <SentenceAnalyzer />}

        {activeView === "quiz" && <QuizMode />}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Official English Syllabus — Ministry of National Education (Senegal)
          </span>
          <span>•</span>
          <span>Middle School / CEM (6ème, 5ème, 4ème, 3ème — BFEM)</span>
          <span>•</span>
          <span>High School / Lycée (2nde, 1ère, Terminale — Baccalauréat)</span>
        </div>
        <p className="max-w-2xl mx-auto text-slate-400 text-[11px] leading-relaxed">
          Interactive AI-powered English grammar learning platform tailored to the Senegalese national curriculum, exam criteria, and Francophone error eradication. Designed for pupils, students, and EFL teachers across Senegal.
        </p>
      </footer>

      {/* Modal Generator */}
      <LessonGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        defaultLevel={generatorLevel}
        defaultTopic={generatorTopic}
        onLessonGenerated={handleLessonGenerated}
      />
    </div>
  );
}
