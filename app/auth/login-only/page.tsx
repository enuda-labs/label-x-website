import { Suspense } from 'react'
import AuthPages from '@/components/auth/auth-pages'
import LoginOnly from '@/components/auth/login-only'
//import Login from '@/components/auth/login'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPages>
        <LoginOnly />
      </AuthPages>
    </Suspense>
  )
}
