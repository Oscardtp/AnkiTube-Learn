"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { FAQS } from "../data"

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <section id="faq" className="section-padding bg-surface">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-on-surface mb-12 text-center">
          Preguntas frecuentes
        </h2>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex justify-between items-center w-full p-6 text-left hover:bg-surface-container-high/50 transition-colors"
                aria-expanded={openFaq === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                <span className="text-lg font-bold text-on-surface pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-6 h-6 text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-45" : ""
                  }`}
                />
              </button>

              <div
                id={`faq-answer-${idx}`}
                role="region"
                className={`overflow-hidden transition-all duration-250 ease-in-out ${
                  openFaq === idx ? "max-h-48" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
