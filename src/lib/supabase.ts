import { createClient } from '@supabase/supabase-js'
import { supabaseClientOptions } from './supabase-config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 환경 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수 누락:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
    serviceKey: !!supabaseServiceKey
  });
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.')
}

// 클라이언트용 (브라우저)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseClientOptions)

// 서버용 (관리자 권한)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

// 데이터베이스 타입 정의
export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  name: string
  birth_date: string
  nickname: string
  created_at: string
  last_login_at?: string
}

export interface Calculation {
  id: string
  user_id: string
  type: 'annual-leave' | 'retirement-pay' | 'retirement-tax'
  title: string
  data: Record<string, unknown>
  created_at: string
}

export interface Notice {
  id: number
  title: string
  content: string
  important: boolean
  badge?: string
  created_at: string
  updated_at: string
}