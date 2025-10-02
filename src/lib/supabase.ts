import { createClient } from '@supabase/supabase-js'
import { supabaseClientOptions } from './supabase-config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 환경 검증 (runtime에서만)
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase 환경 변수 누락:', {
      url: !!supabaseUrl,
      anonKey: !!supabaseAnonKey,
      serviceKey: !!supabaseServiceKey
    });
  }
}

// 빌드 시에는 더미 클라이언트 생성
const isDevelopment = process.env.NODE_ENV === 'development'
const hasValidEnv = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')

// 클라이언트용 (브라우저)
export const supabase = hasValidEnv || isDevelopment 
  ? createClient(supabaseUrl, supabaseAnonKey, supabaseClientOptions)
  : createClient('https://placeholder.supabase.co', 'placeholder-key', supabaseClientOptions)

// 서버용 (관리자 권한)
export const supabaseAdmin = hasValidEnv || isDevelopment
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
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