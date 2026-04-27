"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface DuplicateDeckModalProps {
  deck: {
    deck_id: string;
    video_title: string;
    level: string;
    total_cards: number;
  };
  level: string;
  onClose: () => void;
  onReplace: () => void;
}

export function DuplicateDeckModal({ deck, level, onClose, onReplace }: DuplicateDeckModalProps) {
  const handleReplace = () => {
    onReplace()
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 max-w-md w-full overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-warning/10 border-b border-warning/20 p-6 text-center">
          <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-on-surface">Mazo duplicado detectado</h3>
          <p className="text-sm text-on-surface-variant mt-1">Ya tienes este video en nivel {level}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Existing Deck Info */}
          <div className="bg-surface-container-lowest rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-on-surface truncate">
                  {deck.video_title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-on-surface-variant">
                    Nivel {deck.level} • {deck.total_cards} tarjetas
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant text-center">
            ¿Qué te gustaría hacer?
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* View Existing */}
            <Link
              href={`/preview/${deck.deck_id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <ExternalLink className="w-5 h-5" />
              Ver mazo existente
            </Link>

            {/* Replace */}
            <button
              onClick={handleReplace}
              className="flex items-center justify-center gap-2 border-2 border-primary bg-surface-container-lowest text-primary px-4 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all active:scale-95"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Generar nuevo mazo
            </button>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
