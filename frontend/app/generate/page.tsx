"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AutoFixHigh,
  Movie,
  HeadsetMic,
  Terminal,
  TrendingUp,
  Flight,
  SelfImprovement,
  AutoAwesome,
  CheckCircle,
  Psychology,
  Bolt,
  Verified,
} from "@mui/icons-material";
import { api } from "@/lib/api";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];

const CONTEXTS = [
  { id: "bpo", label: "BPO", icon: HeadsetMic },
  { id: "tech", label: "Tech", icon: Terminal },
  { id: "business", label: "Business", icon: TrendingUp },
  { id: "travel", label: "Travel", icon: Flight },
  { id: "lifestyle", label: "Lifestyle", icon: SelfImprovement },
] as const;
type Context = (typeof CONTEXTS)[number]["id"];

export default function GeneratePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState<Level>("B1");
  const [context, setContext] = useState<Context>("business");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.generateDeck({
        youtube_url: url,
        level,
        context,
      });

      // Redirect to preview page
      router.push(`/preview/${response.deck_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al generar el mazo. Intenta de nuevo."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-surface">
      {/* Header Section */}
      <div className="max-w-2xl w-full text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-wide uppercase mb-6 mx-auto">
          <AutoFixHigh className="w-4 h-4" sx={{ fontVariationSettings: "'FILL' 1" }} />
          ¡Hágale pues!
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          Generar nuevo mazo
        </h2>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Pega el link del video y yo me encargo del resto. <br className="hidden md:block" />
          Tu mentor digital está listo para camellar.
        </p>
      </div>

      {/* Generation Card */}
      <div className="max-w-2xl w-full bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-ambient relative overflow-hidden group">
        {/* Decorative Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors duration-500" />

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          {/* Video Link Input */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">
              YouTube Video URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Movie className="w-5 h-5 text-primary" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="block w-full pl-14 pr-4 py-5 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline-variant focus:ring-4 focus:ring-primary/10 transition-all text-base outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Level Selection */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">
                Nivel de Inglés
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      level === l
                        ? "bg-primary-container text-on-primary-container shadow-sm border-primary"
                        : "bg-surface-container text-on-surface-variant hover:bg-primary-fixed border-transparent"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Selection */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">
                Contexto / Nicho
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTEXTS.map((c) => {
                  const Icon = c.icon;
                  const isSelected = context === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setContext(c.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-secondary text-white shadow-md"
                          : "bg-surface-container text-on-surface-variant hover:bg-secondary-fixed-dim"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error-container rounded-xl text-error-on-container text-sm font-medium">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full bg-gradient-to-r from-primary to-primary-container py-5 px-8 rounded-full text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <AutoAwesome className="w-6 h-6" sx={{ fontVariationSettings: "'FILL' 1" }} />
                  Generar Mazo
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-outline mt-6 font-medium uppercase tracking-widest">
              IA impulsada por el motor de AnkiTube
            </p>
          </div>
        </form>
      </div>

      {/* Bottom Credibility Elements */}
      <div className="mt-16 flex flex-wrap justify-center gap-12 opacity-60">
        <div className="flex items-center gap-3">
          <Verified className="w-5 h-5 text-secondary" />
          <span className="text-sm font-bold text-on-surface-variant">Vocabulario Natural</span>
        </div>
        <div className="flex items-center gap-3">
          <Bolt className="w-5 h-5 text-secondary" />
          <span className="text-sm font-bold text-on-surface-variant">Generación en Segundos</span>
        </div>
        <div className="flex items-center gap-3">
          <Psychology className="w-5 h-5 text-secondary" />
          <span className="text-sm font-bold text-on-surface-variant">Spaced Repetition Ready</span>
        </div>
      </div>

      {/* Success Badge (Floating) */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-white/70 backdrop-blur-glass rounded-2xl p-4 flex items-center gap-4 shadow-glass border border-white/40">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" sx={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Misión cumplida</p>
            <p className="text-sm font-medium text-on-surface">5 mazos generados hoy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
