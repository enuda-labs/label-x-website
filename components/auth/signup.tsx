'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { register } from '@/services/apis/auth'
import { AxiosError } from 'axios'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants'
import Link from 'next/link'

export const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  const role = searchParams.get('role')

  // Password validation rules
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  useEffect(() => {
    if (!role || (role !== 'individual' && role !== 'organization')) {
      router.push('/auth/role')
    }
  }, [router, role])

  const signupMutation = useMutation({
    mutationFn: async (userData: {
      email: string
      password: string
      name: string
      company: string
    }) => {
      const response = await register({
        username: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'organization',
      })
      return response
    },
    onSuccess: (data) => {
      if (data.status === 'success') {
        router.push('/auth/login')
        toast('Account created successfully', {
          description: 'Welcome to Label X',
        })
      } else {
        toast('Signup failed', {
          description: 'Please try again later',
        })
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || err.message)
      } else {
        setError('An unexpected error occurred')
      }
      toast('Signup failed', {
        description: 'Please try again later',
      })
    },
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!role) return router.push('/auth/role')

    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements')
      setPasswordTouched(true)
      return
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    signupMutation.mutate({ email, password, name, company })
  }

  const ValidationIcon = ({ isValid }: { isValid: boolean }) =>
    isValid ? (
      <Check size={16} className="text-green-500" />
    ) : (
      <X size={16} className="text-red-500" />
    )

  return (
    <>
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="name">Username *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signupEmail">Email *</Label>
            <Input
              id="signupEmail"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name (Optional)</Label>
          <Input
            id="company"
            type="text"
            placeholder="Acme Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border-white/10 bg-white/5 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signupPassword">Password *</Label>
          <div className="relative">
            <Input
              id="signupPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (!passwordTouched) setPasswordTouched(true)
              }}
              onBlur={() => setPasswordTouched(true)}
              required
              className={`w-full border-white/10 bg-white/5 py-3 pr-12 text-white ${
                passwordTouched && !isPasswordValid ? 'border-red-500/50' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white hover:bg-black/30"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Requirements */}
          {passwordTouched && password && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="font-medium text-white/80">
                Password Requirements:
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.minLength} />
                  <span
                    className={
                      passwordValidation.minLength
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.hasUppercase} />
                  <span
                    className={
                      passwordValidation.hasUppercase
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.hasLowercase} />
                  <span
                    className={
                      passwordValidation.hasLowercase
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.hasNumber} />
                  <span
                    className={
                      passwordValidation.hasNumber
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ValidationIcon isValid={passwordValidation.hasSpecialChar} />
                  <span
                    className={
                      passwordValidation.hasSpecialChar
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {`One special character (!@#$%^&*()_+-=[]{}|;':",./<>?)`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 text-sm text-white/60">
          Selected plan:{' '}
          <span className="text-primary font-medium">
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
        </div>

        <span className="mb-2 inline-block text-sm text-red-500">{error}</span>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 h-12 w-full"
          disabled={signupMutation.isPending || !isPasswordValid}
        >
          {signupMutation.isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      <div className="flex items-end justify-end">
        Have an account?{' '}
        <Link
          href="/auth/login"
          className="text-primary ml-2 font-semibold hover:underline"
        >
          Login
        </Link>
      </div>
    </>
  )
}

export default Signup
