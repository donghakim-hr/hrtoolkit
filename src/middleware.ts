import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseConfig } from './lib/supabase-config'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 보안 헤더 추가
  Object.entries(supabaseConfig.securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // CORS 헤더 설정
  const origin = request.headers.get('origin')
  
  if (origin && supabaseConfig.allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  // Preflight 요청 처리
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }
  
  // API 경로 보안 검사
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Rate limiting은 Vercel Pro 이상에서 가능
    // 여기서는 기본적인 검증만 수행
    
    const userAgent = request.headers.get('user-agent')
    
    // 의심스러운 요청 차단
    if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
      // 정상적인 검색엔진 봇은 제외
      if (!userAgent.includes('Googlebot') && !userAgent.includes('Bingbot')) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}