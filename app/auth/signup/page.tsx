import { Suspense } from 'react'
import AuthPages from '@/components/auth/auth-pages'
import Signup from '@/components/auth/signup'

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthPages>
      <Signup />
        </AuthPages>
    </Suspense>
  )
}
