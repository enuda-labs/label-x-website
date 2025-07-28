import { Suspense } from 'react'
import AuthPages from '@/components/auth/auth-pages'
import Login from '@/components/auth/login'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPages>
      <Login />
        </AuthPages>
    </Suspense>
  )
}
