import React, { useState } from "react";
import { SentenceAnalysisResult } from "../types";
import {
  Wand2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Layers,
} from "lucide-react";

const SAMPLE_SENTENCES = [
  {
    title: "Mariama Bâ (So Long a Letter)",
    text: "The childhood friends whom Ramatoulaye met again in Dakar greeted each other warmly.",
    level: "3ème (BFEM)",
  },
  {
    title: "Léopold Sédar Senghor (Shadow Songs)",
    text: "Naked woman, black woman, clothed with your colour which is life, with your form which is beauty!",
    level: "1ère (BAC)",
  },
  {
    title: "Cheikh Hamidou Kane (Ambiguous Adventure)",
    text: "The master of the Diallobé insisted that the young disciple recite the sacred verses without hesitation.",
    level: "2nde / 1ère",
  },
  {
    title: "BFEM Model Paper (Concession & Purpose)",
    text: "Although the rainy season was delayed, the farmers in Baol prepared their fields with determination in order to guarantee a good harvest.",
    level: "3ème (BFEM)",
  },
  {
    title: "Baccalauréat Examination (Negative Inversion)",
    text: "Hardly had the candidates entered the examination hall when the supervisor distributed the English papers.",
    level: "Terminale (BAC)",
  },
];

export const SentenceAnalyzer: React.FC = () => {
  const [sentence, setSentence] = useState<string>("");
  const [level, setLevel] = useState<string>("3ème");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<SentenceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!sentence.trim()) {
      setError("Please enter an English sentence to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentence.trim(), level }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error during sentence analysis.");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not connect to the analysis engine.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tool Header */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Wand2 className="w-4 h-4" />
          <span>Intelligent Pedagogical Tool</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
          Sentence Syntax & Grammar Coach
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Enter any English sentence (literary extracts, BFEM exam items, or Baccalauréat rephrasing prompts) to obtain a thorough clause breakdown, word class analysis, and examiner feedback on Francophone interference errors.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Sentence to Analyze:
          </label>
          <textarea
            rows={3}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Paste or type your English sentence here..."
            className="w-full p-3.5 text-xs sm:text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-serif leading-relaxed"
          />
        </div>

        {/* Suggested phrases */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Sample sentences inspired by Senegalese literature & national exams:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SENTENCES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSentence(s.text);
                  setLevel(s.level.includes("BAC") ? "Terminale" : "3ème");
                }}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors text-left font-medium"
              >
                <span className="font-semibold text-emerald-800">{s.title}:</span> « {s.text.slice(0, 45)}... »
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Target Curriculum Level:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="6ème">6ème</option>
              <option value="5ème">5ème</option>
              <option value="4ème">4ème</option>
              <option value="3ème">3ème (BFEM)</option>
              <option value="2nde">2nde</option>
              <option value="1ère">1ère (BAC)</option>
              <option value="Terminale">Terminale (BAC)</option>
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing sentence with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Analyze Sentence Syntax</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-6">
          {/* Sentence Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Overall Sentence Architecture</span>
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
                Class of {level}
              </span>
            </div>

            <p className="font-serif font-semibold text-slate-900 text-base sm:text-lg p-4 bg-slate-50 rounded-2xl border border-slate-200 leading-relaxed">
              « {analysis.sentence} »
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-0.5">Sentence Type:</span>
                <span className="font-bold text-slate-800">{analysis.typeAndForm?.type || "Declarative"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-0.5">Voice & Aspect:</span>
                <span className="font-bold text-slate-800">{analysis.typeAndForm?.form || "Affirmative, Active Voice"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-0.5">Syntactic Structure:</span>
                <span className="font-bold text-slate-800">{analysis.typeAndForm?.structure || "Complex Sentence"}</span>
              </div>
            </div>
          </div>

          {/* Logical Analysis: Propositions / Clauses */}
          {analysis.propositions && analysis.propositions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Clause Analysis (Main, Coordinate & Subordinate Clauses)</span>
              </h3>

              <div className="space-y-3">
                {analysis.propositions.map((prop, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 font-serif">
                        Clause {idx + 1}: « {prop.text} »
                      </span>
                      {prop.connective && (
                        <span className="text-[11px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-semibold">
                          Connector: {prop.connective}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-400 block font-semibold">Clause Type:</span>
                        <span className="font-bold text-emerald-900">{prop.nature}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-400 block font-semibold">Syntactic Function:</span>
                        <span className="font-bold text-slate-800">{prop.function}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Morphosyntactic word-by-word breakdown */}
          {analysis.wordsAnalysis && analysis.wordsAnalysis.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>Grammatical Analysis of Key Segments & Words</span>
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <th className="p-3">Word / Phrase</th>
                      <th className="p-3">Part of Speech</th>
                      <th className="p-3">Function in Sentence</th>
                      <th className="p-3">Examiner Pedagogical Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {analysis.wordsAnalysis.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-serif font-bold text-slate-900">
                          {item.segment}
                        </td>
                        <td className="p-3 font-medium text-emerald-800">
                          {item.nature}
                        </td>
                        <td className="p-3 text-slate-700">
                          {item.function}
                        </td>
                        <td className="p-3 text-slate-500 italic text-xs">
                          {item.pedagogicalNote || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Examiner feedback */}
          {analysis.senegaleseExamFeedback && (
            <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Senegalese National Examination Board / Inspector Insights:</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                {analysis.senegaleseExamFeedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
