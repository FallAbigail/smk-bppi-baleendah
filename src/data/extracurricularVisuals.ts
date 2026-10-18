import {
  Activity,
  Code2,
  Music,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { ExtracurricularCategory } from './extracurriculars'

export const categoryVisuals: Record<ExtracurricularCategory, { icon: LucideIcon; tone: string; labelTone: string }> = {
  Teknologi: {
    icon: Code2,
    tone: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
    labelTone: 'text-sky-700 dark:text-sky-300',
  },
  Seni: {
    icon: Music,
    tone: 'bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',
    labelTone: 'text-violet-700 dark:text-violet-300',
  },
  Olahraga: {
    icon: Activity,
    tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
    labelTone: 'text-emerald-700 dark:text-emerald-300',
  },
  'Organisasi & layanan': {
    icon: UsersRound,
    tone: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    labelTone: 'text-amber-800 dark:text-amber-300',
  },
}
