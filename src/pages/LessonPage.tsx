import { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessonById } from '../data/hangulLessons'
import { questNodes } from '../data/questMap'
import { LessonCard } from '../components/LessonCard'
import type { IntroStep, LessonStep, QuizStep } from '../types/game'
import { useGame } from '../state/useGame'

function isQuiz(s: LessonStep): s is QuizStep {
  return s.kind !== 'intro'
}

function playTone(ok: boolean, enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = ok ? 660 : 220
    g.gain.value = 0.06
    o.start()
    o.stop(ctx.currentTime + 0.08)
  } catch {
    /* ignore */
  }
}

function formatPrompt(md: string): ReactNode {
  const parts = md.split(/\*\*(.*?)\*\*/g)
  return parts.map((chunk, i) => (i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <span key={i}>{chunk}</span>))
}

interface ChoiceListProps {
  step: QuizStep
  selected: number | null
  onPick: (idx: number) => void
}

const ChoiceList = memo(function ChoiceList({ step, selected, onPick }: ChoiceListProps) {
  return (
    <ul className="choice-grid">
      {step.choices.map((choice, i) => {
        const isSel = selected === i
        const showCorrect = selected !== null && i === step.answerIndex
        const showWrong = isSel && i !== step.answerIndex
        return (
          <li key={`${step.id}-${i}`}>
            <button
              type="button"
              className={`choice-btn ${showCorrect ? 'choice-correct' : ''} ${showWrong ? 'choice-wrong' : ''}`}
              onClick={() => onPick(i)}
              disabled={selected !== null && selected === step.answerIndex}
            >
              <span className="hangul-choice">{choice}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
})

/** Remount with `key={lessonId}` so step state resets without an effect. */
function LessonRunner({ lessonId }: { lessonId: string }) {
  const navigate = useNavigate()
  const { state, completeLesson } = useGame()

  const lesson = lessonById(lessonId)
  const node = questNodes.find((n) => n.lessonId === lessonId)

  const unlocked = node && state.unlockedNodeIds.includes(node.id)
  const alreadyDone = lesson && state.completedLessonIds.includes(lesson.id)

  const [stepIndex, setStepIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const bonusRef = useRef(0)

  const step = lesson?.steps[stepIndex]

  useEffect(() => {
    if (!step || step.kind === 'intro') {
      const resetId = window.setTimeout(() => setTimeLeft(null), 0)
      return () => window.clearTimeout(resetId)
    }
    if (step.kind === 'timed_quiz' || (step.kind === 'boss' && step.timeLimitSec)) {
      const lim = step.timeLimitSec ?? 12
      const resetId = window.setTimeout(() => setTimeLeft(lim), 0)
      const id = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return prev
          if (prev <= 1) return 0
          return prev - 1
        })
      }, 1000)
      return () => {
        window.clearTimeout(resetId)
        window.clearInterval(id)
      }
    }
    const resetId = window.setTimeout(() => setTimeLeft(null), 0)
    return () => window.clearTimeout(resetId)
  }, [step])

  function resetLessonUi() {
    setStepIndex(0)
    setSelected(null)
    setWrong(false)
    setFinished(false)
    setTimeLeft(null)
    bonusRef.current = 0
  }

  function advance() {
    if (!lesson) return
    if (stepIndex >= lesson.steps.length - 1) {
      setFinished(true)
      const extra = bonusRef.current
      if (!alreadyDone) {
        completeLesson(lesson.id, extra)
      }
      return
    }
    setStepIndex((i) => i + 1)
    setSelected(null)
    setWrong(false)
  }

  function onPick(idx: number) {
    if (!step || step.kind === 'intro') return
    setSelected(idx)
    const correct = idx === step.answerIndex
    playTone(correct, state.soundEnabled)
    if (correct) {
      setWrong(false)
      if (step.bonusXp) {
        bonusRef.current += step.bonusXp
      }
      window.setTimeout(advance, 450)
    } else {
      setWrong(true)
    }
  }

  if (!lesson) {
    return (
      <div className="lesson-page">
        <p>Lesson not found.</p>
        <Link to="/map">Back to map</Link>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div className="lesson-page">
        <div className="card lesson-locked" role="status" aria-live="polite">
          <h1>Quest locked</h1>
          <p className="muted">Clear the previous node on the map to enter this trial.</p>
          <Link to="/map" className="btn btn-primary">
            Return to map
          </Link>
        </div>
      </div>
    )
  }

  const totalSteps = lesson.steps.length
  const progressPct = ((stepIndex + (finished ? 1 : 0)) / totalSteps) * 100
  const bar = (
    <div className="lesson-progress" aria-hidden>
      <div className="lesson-progress-fill" style={{ width: `${progressPct}%` }} />
    </div>
  )

  if (finished) {
    return (
      <div className="lesson-page">
        <div className="card lesson-complete">
          <p className="eyebrow">Quest complete</p>
          <h1>{lesson.title}</h1>
          <p className="muted">
            {alreadyDone
              ? 'You already earned XP for this lesson — nice recap run!'
              : 'XP and badges are yours. Check the home badge case for new unlocks.'}
          </p>
          <div className="lesson-complete-actions">
            <Link to="/map" className="btn btn-primary">
              View map
            </Link>
            <Link to="/" className="btn btn-ghost">
              Home
            </Link>
            <button type="button" className="btn btn-ghost" onClick={resetLessonUi}>
              Replay lesson
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-page">
      <button type="button" className="link-back" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {bar}
      <header className="lesson-head">
        <p className="eyebrow">{node?.title}</p>
        <h1>{lesson.title}</h1>
        <p className="muted">{lesson.subtitle}</p>
        {alreadyDone ? <p className="pill replay-pill">Practice run — XP already claimed</p> : null}
      </header>

      {step?.kind === 'intro' ? (
        <LessonCard step={step as IntroStep} onContinue={advance} />
      ) : step && isQuiz(step) ? (
        <div className="card quiz-card">
          <div className="quiz-top">
            {(step.kind === 'timed_quiz' || Boolean(step.timeLimitSec)) && timeLeft !== null ? (
              <span className={`pill timer-pill ${timeLeft <= 3 ? 'timer-warn' : ''}`}>
                ⏱ {timeLeft}s
              </span>
            ) : (
              <span className="pill">{step.kind === 'boss' ? 'Boss trial' : 'Practice'}</span>
            )}
          </div>
          <h2 className="quiz-prompt">{formatPrompt(step.prompt)}</h2>
          {wrong && step.hint ? <p className="hint">Hint: {step.hint}</p> : null}
          {step.kind === 'timed_quiz' && timeLeft === 0 && selected === null ? (
            <p className="hint warn">Time is up — pick the best answer to continue.</p>
          ) : null}
          {selected !== null && selected === step.answerIndex ? (
            <p className="hint" role="status" aria-live="polite">
              Correct. Advancing to the next step...
            </p>
          ) : null}
          <ChoiceList step={step} selected={selected} onPick={onPick} />
        </div>
      ) : null}
    </div>
  )
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()

  if (!lessonId) {
    return (
      <div className="lesson-page">
        <p>Lesson not found.</p>
        <Link to="/map">Back to map</Link>
      </div>
    )
  }

  return <LessonRunner key={lessonId} lessonId={lessonId} />
}
