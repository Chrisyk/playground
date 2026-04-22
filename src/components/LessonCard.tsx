import type { IntroStep } from '../types/game'

interface LessonCardProps {
  step: IntroStep
  onContinue: () => void
}

export function LessonCard({ step, onContinue }: LessonCardProps) {
  return (
    <article className="lesson-card card animate-float">
      {step.story ? (
        <p className="lesson-story" role="doc-subtitle">
          {step.story}
        </p>
      ) : null}
      <h2 className="lesson-card-title">{step.title}</h2>
      <p className="lesson-card-body">{step.body}</p>
      <button type="button" className="btn btn-primary lesson-continue" onClick={onContinue}>
        Continue quest
      </button>
    </article>
  )
}
