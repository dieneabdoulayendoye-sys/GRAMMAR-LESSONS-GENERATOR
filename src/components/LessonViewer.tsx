import React, { useState } from "react";
import { Lesson, Exercise } from "../types";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  BookMarked,
  Lightbulb,
  Award,
  ChevronRight,
  ShieldCheck,
  Bookmark,
} from "lucide-react";
import confetti from "canvas-confetti";

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
  onRegenerate: () => void;
  isMastered: boolean;
  onToggleMastered: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onBack,
  onRegenerate,
  isMastered,
  onToggleMastered,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"lesson" | "exercises" | "tips">("lesson");
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Text-To-Speech
  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    // Build text to read
    const textToRead = `${lesson.title}. ${lesson.subtitle}. ${lesson.lessonSections
      .map((s) => `${s.heading}. ${s.content}`)
      .join(" ")}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "en-US";
    utterance.rate = 0.95;

    // Try finding an English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith("en"));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAnswerSelect = (exId: string, answerIndex: number, isCorrect: boolean) => {
    setUserAnswers((prev) => ({ ...prev, [exId]: answerIndex }));
    setRevealedExplanations((prev) => ({ ...prev, [exId]: true }));

    if (isCorrect) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (_err) {
        // Fallback safely
      }
    }
  };

  const handleTextAnswerSubmit = (ex: Exercise, inputVal: string) => {
    setUserAnswers((prev) => ({ ...prev, [ex.id]: inputVal.trim() }));
    setRevealedExplanations((prev) => ({ ...prev, [ex.id]: true }));

    const isMatch =
      inputVal.trim().toLowerCase() === (ex.correctAnswer || "").trim().toLowerCase();

    if (isMatch) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch (_err) {
        // Fallback safely
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0 print:max-w-none">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Syllabus</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Audio Lecture */}
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
              isPlayingAudio
                ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
            }`}
            title="Écouter la lecture audio du cours"
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlayingAudio ? "Arrêter la voix" : "Écouter la leçon"}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1.5"
            title="Imprimer ou exporter en PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer / Fiche</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1.5"
            title="Partager cette leçon"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copiedLink ? "Copié !" : "Partager"}</span>
          </button>

          {/* Mastered toggle */}
          <button
            onClick={onToggleMastered}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              isMastered
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isMastered ? "fill-emerald-600 text-emerald-600" : ""}`} />
            <span>{isMastered ? "Notion maîtrisée" : "Marquer comme acquise"}</span>
          </button>

          {/* Regenerate AI */}
          <button
            onClick={onRegenerate}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Approfondir avec l'IA</span>
          </button>
        </div>
      </div>

      {/* Lesson Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-emerald-800 text-white">
            Classe de {lesson.level}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
            {lesson.domain}
          </span>
          {lesson.duration && (
            <span className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 bg-slate-100">
              Durée indicative : {lesson.duration}
            </span>
          )}
          {lesson.isAiGenerated && (
            <span className="px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-100 border border-teal-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Générée sur mesure par l'IA
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-serif tracking-tight leading-tight">
          {lesson.title}
        </h1>

        <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          {lesson.subtitle}
        </p>

        {/* Objectives Box */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-2 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Objectifs Pédagogiques (Syllabus National du Sénégal)
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
              {lesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 space-x-6 text-sm font-semibold print:hidden">
        <button
          onClick={() => setActiveTab("lesson")}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === "lesson"
              ? "border-emerald-700 text-emerald-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Lesson & Grammar Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("tips")}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === "tips"
              ? "border-emerald-700 text-emerald-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>National Exam Corner ({lesson.senegaleseExamTips?.examName || "BFEM & BAC"})</span>
        </button>

        <button
          onClick={() => setActiveTab("exercises")}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === "exercises"
              ? "border-emerald-700 text-emerald-800 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Practice Exercises ({lesson.interactiveExercises?.length || 0})</span>
        </button>
      </div>

      {/* Tab: Main Lesson Content */}
      {activeTab === "lesson" && (
        <div className="space-y-6">
          {/* Phase 1: Observation Corpus */}
          {lesson.observationCorpus && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  I
                </span>
                <span>Observation & Discovery Phase (Senegalese Context)</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 italic">
                {lesson.observationCorpus.introduction}
              </p>

              {/* Sentences Carousel / List */}
              <div className="space-y-3">
                {(lesson.observationCorpus?.sentences || []).map((sent, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-amber-50/50 border-l-4 border-amber-500 text-slate-800 space-y-1"
                  >
                    <p className="text-sm sm:text-base font-serif font-medium leading-relaxed">
                      « {sent.text} »
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                      {sent.author && <span className="font-semibold text-amber-900">— {sent.author}</span>}
                      {sent.focusWords && (
                        <span className="text-[11px] font-mono bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-md">
                          Focus: {sent.focusWords}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Guided Analysis Questions */}
              {lesson.observationCorpus?.analysisQuestions &&
                lesson.observationCorpus.analysisQuestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      Guided Analysis Questions:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                      {(lesson.observationCorpus.analysisQuestions || []).map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
            </div>
          )}

          {/* Phase 2: Lesson Sections */}
          {(lesson.lessonSections || []).map((sec, secIdx) => (
            <div
              key={sec.id || secIdx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5"
            >
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {secIdx + 2}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                  {sec.heading}
                </span>
              </div>

              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {sec.content}
              </div>

              {/* Key Rules Callout */}
              {sec.keyRules && sec.keyRules.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
                    <Lightbulb className="w-4 h-4 text-emerald-700" />
                    <span>Règles fondamentales à retenir</span>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-950 font-medium">
                    {(sec.keyRules || []).map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start space-x-2">
                        <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples with analysis */}
              {sec.examples && sec.examples.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Exemples décortiqués :
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {(sec.examples || []).map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm"
                      >
                        <p className="font-serif font-semibold text-slate-900 mb-1">
                          « {ex.phrase} »
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          <span className="font-semibold text-emerald-800">Analyse :</span> {ex.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison / Synoptic Table */}
              {sec.comparisonTable && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-3">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                        {(sec.comparisonTable.headers || []).map((h, hIdx) => (
                          <th key={hIdx} className="p-3 border-r border-slate-200 last:border-r-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {(sec.comparisonTable.rows || []).map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50">
                          {(row || []).map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-3 border-r border-slate-200 last:border-r-0 text-slate-700 leading-relaxed font-medium"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* Phase 3: Summary Memo / Règle d'or */}
          {lesson.summaryMemo && (
            <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Fiche Mémo • La Règle d'Or en 1 Minute</span>
              </div>

              <div className="text-lg sm:text-xl font-bold font-serif text-emerald-200 italic border-l-4 border-amber-400 pl-4 py-1">
                {lesson.summaryMemo.catchphrase}
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-200">
                {(lesson.summaryMemo.bullets || []).map((b, bIdx) => (
                  <li key={bIdx} className="flex items-start space-x-2 bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab: Spécial Examen (BFEM & BAC) */}
      {activeTab === "tips" && lesson.senegaleseExamTips && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 w-fit">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Cible officielle : {lesson.senegaleseExamTips.examName}</span>
            </div>

            {/* Trap to avoid */}
            <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2">
              <div className="flex items-center space-x-2 text-red-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Le Piège classique dans les copies sénégalaises :</span>
              </div>
              <p className="text-xs sm:text-sm text-red-950 leading-relaxed font-medium">
                {lesson.senegaleseExamTips.trapToAvoid}
              </p>
            </div>

            {/* Secret of examiners */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Le Secret du Correcteur / Inspecteur :</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                {lesson.senegaleseExamTips.examinerSecret}
              </p>
            </div>

            {/* Exam Question Model & Answer */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Sujet Type d'Épreuve Nationale :
              </div>
              <div className="font-serif font-bold text-sm sm:text-base text-slate-900 p-3 bg-white rounded-xl border border-slate-200">
                {lesson.senegaleseExamTips.examQuestionModel}
              </div>

              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 pt-2">
                Réponse Modèle Attendue par le Jury :
              </div>
              <div className="text-xs sm:text-sm text-slate-700 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 leading-relaxed">
                {lesson.senegaleseExamTips.modelAnswer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Interactive Exercises */}
      {activeTab === "exercises" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-serif">
                  Exercices d'Application & Évaluation Formative
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Validez votre compréhension immédiate avec corrections détaillées.
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 bg-teal-100 text-teal-800 rounded-full">
                {lesson.interactiveExercises?.length || 0} exercices
              </span>
            </div>

            <div className="space-y-6 divide-y divide-slate-100">
              {(lesson.interactiveExercises || []).map((ex, idx) => {
                const isAnswered = userAnswers[ex.id] !== undefined;
                const selectedOptionIdx = typeof userAnswers[ex.id] === "number" ? (userAnswers[ex.id] as number) : -1;
                const isQcmCorrect = selectedOptionIdx === ex.correctIndex;
                const showExplanation = revealedExplanations[ex.id];
                const showHint = revealedHints[ex.id];

                return (
                  <div key={ex.id || idx} className="pt-6 first:pt-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        Exercice {idx + 1} • {ex.type.toUpperCase()}
                      </span>

                      {ex.hint && !showHint && (
                        <button
                          onClick={() => setRevealedHints((p) => ({ ...p, [ex.id]: true }))}
                          className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 font-medium"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Besoin d'un indice ?</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      {ex.instruction}
                    </p>

                    {/* Hint Callout */}
                    {showHint && ex.hint && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Indice :</strong> {ex.hint}</span>
                      </div>
                    )}

                    {/* QCM Type */}
                    {ex.type === "qcm" && ex.options && (
                      <div className="space-y-3">
                        {ex.question && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-serif font-medium text-slate-900 text-sm">
                            {ex.question}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {ex.options.map((opt, optIdx) => {
                            const isSelected = selectedOptionIdx === optIdx;
                            const isCorrectOpt = optIdx === ex.correctIndex;

                            let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50";
                            if (isAnswered) {
                              if (isCorrectOpt) {
                                btnStyle = "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-400/30";
                              } else if (isSelected && !isCorrectOpt) {
                                btnStyle = "bg-red-50 border-red-300 text-red-900";
                              } else {
                                btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() => handleAnswerSelect(ex.id, optIdx, optIdx === ex.correctIndex)}
                                className={`p-3 text-left text-xs sm:text-sm rounded-xl border transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isCorrectOpt && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fill the Gap / Analysis Type */}
                    {(ex.type === "fill_gap" || ex.type === "analysis") && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-serif text-slate-900 text-sm leading-relaxed">
                          {ex.sentenceWithGap}
                        </div>

                        {!isAnswered ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.target as HTMLFormElement;
                              const input = form.elements.namedItem("userResp") as HTMLInputElement;
                              if (input && input.value.trim()) {
                                handleTextAnswerSubmit(ex, input.value);
                              }
                            }}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              name="userResp"
                              placeholder={ex.type === "fill_gap" ? "Tapez la bonne forme..." : "Tapez votre réponse ou analyse..."}
                              className="flex-1 px-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs"
                            >
                              Valider
                            </button>
                          </form>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                            <span className="text-slate-500">Votre réponse :</span>{" "}
                            <span className="font-bold text-slate-900">{String(userAnswers[ex.id])}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detailed Explanation */}
                    {showExplanation && (
                      <div
                        className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                          (ex.type === "qcm" && isQcmCorrect) ||
                          ((ex.type === "fill_gap" || ex.type === "analysis") &&
                            String(userAnswers[ex.id]).toLowerCase() === (ex.correctAnswer || "").toLowerCase())
                            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                            : "bg-amber-50 border-amber-200 text-amber-950"
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Correction & Justification Grammaticale :</span>
                        </div>
                        {ex.correctAnswer && (
                          <div className="font-mono text-xs font-bold text-emerald-900">
                            Réponse officielle : « {ex.correctAnswer} »
                          </div>
                        )}
                        <p>{ex.detailedExplanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au sommaire du niveau {lesson.level}</span>
        </button>

        <button
          onClick={onRegenerate}
          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center space-x-2 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Générer un autre cours sur ce thème</span>
        </button>
      </div>
    </div>
  );
};
