import type { BadgeDef, QuestNode, QuestZone } from '../types/game'

export const questZones: QuestZone[] = [
  {
    id: 'hongdae',
    name: 'Hongdae Hub',
    tagline: 'Neon beats meet your first Hangul sparks.',
    color: '#ff6b9d',
  },
  {
    id: 'han_river',
    name: 'Han River Run',
    tagline: 'Flow like water through syllable blocks.',
    color: '#4ecdc4',
  },
  {
    id: 'namsan',
    name: 'Namsan Heights',
    tagline: 'Boss trials with a view of the whole alphabet.',
    color: '#ffe66d',
  },
]

export const questNodes: QuestNode[] = [
  {
    id: 'node_gate',
    zoneId: 'hongdae',
    title: 'The Hangul Gate',
    lessonId: 'lesson-consonants',
    position: { x: 14, y: 52 },
    prerequisiteNodeIds: [],
  },
  {
    id: 'node_glade',
    zoneId: 'hongdae',
    title: 'Vowel Glade',
    lessonId: 'lesson-vowels',
    position: { x: 42, y: 40 },
    prerequisiteNodeIds: ['node_gate'],
  },
  {
    id: 'node_bridge',
    zoneId: 'han_river',
    title: 'Syllable Bridge',
    lessonId: 'lesson-syllables',
    position: { x: 58, y: 58 },
    prerequisiteNodeIds: ['node_glade'],
  },
  {
    id: 'node_summit',
    zoneId: 'namsan',
    title: 'Summit Trial',
    lessonId: 'lesson-boss',
    position: { x: 82, y: 36 },
    prerequisiteNodeIds: ['node_bridge'],
  },
]

export const badgeCatalog: BadgeDef[] = [
  {
    id: 'badge_first_gate',
    name: 'First Gate',
    description: 'Clear your first quest on the map.',
    icon: '🚪',
  },
  {
    id: 'badge_hongdae_hero',
    name: 'Hongdae Hero',
    description: 'Finish both lessons in Hongdae Hub.',
    icon: '🎸',
  },
  {
    id: 'badge_river_runner',
    name: 'River Runner',
    description: 'Cross the Syllable Bridge.',
    icon: '🌉',
  },
  {
    id: 'badge_summit_scholar',
    name: 'Summit Scholar',
    description: 'Conquer the Summit Trial boss lesson.',
    icon: '⛰️',
  },
  {
    id: 'badge_streak_3',
    name: 'Triple Ember',
    description: 'Maintain a 3-day learning streak.',
    icon: '🔥',
  },
  {
    id: 'badge_daily_champion',
    name: 'Daily Champion',
    description: 'Complete the daily mission (2 lessons in one day).',
    icon: '⭐',
  },
]
