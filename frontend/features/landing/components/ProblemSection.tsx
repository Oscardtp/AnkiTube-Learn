import { PROBLEMS } from "../data"

export default function ProblemSection() {
  return (
    <section id="problema" className="section-padding">
      <div className="container-limit">
        <h2 className="text-3xl font-extrabold text-on-surface mb-12 text-center">
          ¿Te suena esto?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map((problem, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border-l-[4px] border-error card-hover"
            >
              <problem.icon className="w-8 h-8 text-error mb-4" />
              <p className="text-lg text-on-surface font-medium leading-relaxed">{problem.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
