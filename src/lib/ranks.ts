import type { UserRank, RankName } from '@/types/database'

export const RANK_DEFINITIONS: UserRank[] = [
  { id: 'rank-bronze', name: 'bronze', display_name: 'ブロンズ', min_spent: 0, point_bonus_rate: 0, gacha_discount_rate: 0, created_at: '' },
  { id: 'rank-silver', name: 'silver', display_name: 'シルバー', min_spent: 10000, point_bonus_rate: 3, gacha_discount_rate: 0, created_at: '' },
  { id: 'rank-gold', name: 'gold', display_name: 'ゴールド', min_spent: 50000, point_bonus_rate: 5, gacha_discount_rate: 5, created_at: '' },
  { id: 'rank-platinum', name: 'platinum', display_name: 'プラチナ', min_spent: 200000, point_bonus_rate: 10, gacha_discount_rate: 10, created_at: '' },
  { id: 'rank-diamond', name: 'diamond', display_name: 'ダイヤモンド', min_spent: 500000, point_bonus_rate: 15, gacha_discount_rate: 15, created_at: '' },
]

export function getUserRank(totalSpent: number): UserRank {
  let currentRank = RANK_DEFINITIONS[0]
  for (const rank of RANK_DEFINITIONS) {
    if (totalSpent >= rank.min_spent) {
      currentRank = rank
    }
  }
  return currentRank
}

export function getNextRank(totalSpent: number): UserRank | null {
  for (const rank of RANK_DEFINITIONS) {
    if (totalSpent < rank.min_spent) {
      return rank
    }
  }
  return null
}

export function getAmountToNextRank(totalSpent: number): number | null {
  const next = getNextRank(totalSpent)
  if (!next) return null
  return next.min_spent - totalSpent
}

export const RANK_COLORS: Record<RankName, { bg: string; text: string; border: string; badge: string }> = {
  bronze: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    badge: 'bg-orange-500',
  },
  silver: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
    border: 'border-zinc-400',
    badge: 'bg-zinc-400',
  },
  gold: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-400',
    badge: 'bg-amber-500',
  },
  platinum: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-400',
    badge: 'bg-cyan-500',
  },
  diamond: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-400',
    badge: 'bg-violet-500',
  },
}
