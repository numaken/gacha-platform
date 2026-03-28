export type UserRole = 'user' | 'admin'
export type GachaType = 'normal' | 'daily' | 'infinite'
export type PrizeRank = 'S' | 'A' | 'B' | 'C' | 'last_one'
export type PointTransactionType = 'purchase' | 'gacha' | 'refund' | 'admin_adjust' | 'expire' | 'exchange'
export type GachaResultStatus = 'won' | 'shipped' | 'delivered' | 'exchanged'
export type RankName = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
export type ShippingStatus = 'pending' | 'processing' | 'shipped' | 'delivered'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  phone: string | null
  postal_code: string | null
  prefecture: string | null
  city: string | null
  address: string | null
  building: string | null
  point_balance: number
  total_spent: number
  role: UserRole
  created_at: string
  updated_at: string
}

export interface UserRank {
  id: string
  name: RankName
  display_name: string
  min_spent: number
  point_bonus_rate: number
  gacha_discount_rate: number
  created_at: string
}

export interface PointPackage {
  id: string
  name: string
  points: number
  price: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  amount: number
  type: PointTransactionType
  description: string | null
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface Gacha {
  id: string
  name: string
  description: string | null
  price: number
  type: GachaType
  image_url: string | null
  is_active: boolean
  total_count: number | null
  remaining_count: number | null
  daily_limit: number | null
  pity_count: number | null
  pity_rank: PrizeRank | null
  min_total_spent: number | null
  sale_start_at: string | null
  sale_end_at: string | null
  retry_cost: number | null
  sort_order: number
  created_at: string
  updated_at: string
  prizes?: Prize[]
}

export interface Prize {
  id: string
  gacha_id: string
  name: string
  description: string | null
  rank: PrizeRank
  image_url: string | null
  probability: number
  stock: number
  initial_stock: number
  is_last_one: boolean
  once_per_user: boolean
  exchange_points: number | null
  sort_order: number
  created_at: string
}

export interface GachaResult {
  id: string
  user_id: string
  gacha_id: string
  prize_id: string
  points_spent: number
  status: GachaResultStatus
  retried: boolean
  created_at: string
  prize?: Prize
  gacha?: Gacha
}

export interface ShippingRequest {
  id: string
  user_id: string
  status: ShippingStatus
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: ShippingRequestItem[]
}

export interface ShippingRequestItem {
  id: string
  shipping_request_id: string
  gacha_result_id: string
  gacha_result?: GachaResult
}

export interface Order {
  id: string
  user_id: string
  point_package_id: string | null
  amount: number
  points: number
  status: OrderStatus
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  created_at: string
  updated_at: string
}
