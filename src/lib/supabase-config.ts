// Supabase 보안 설정
export const supabaseConfig = {
  // 허용된 도메인 목록
  allowedOrigins: [
    'https://hrtoolkit.co.kr',
    'https://www.hrtoolkit.co.kr',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ],
  
  // API 제한 설정
  rateLimits: {
    auth: {
      requests: 50, // 1시간당 50번의 인증 시도
      window: 3600 // 1시간
    },
    api: {
      requests: 1000, // 1시간당 1000번의 API 호출
      window: 3600
    }
  },

  // 보안 헤더
  securityHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
};

// 도메인 검증 함수
export function validateOrigin(origin: string): boolean {
  return supabaseConfig.allowedOrigins.includes(origin);
}

// Supabase 클라이언트 옵션
export const supabaseClientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'hr-toolkit-web'
    }
  }
};