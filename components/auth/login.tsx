'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { login, LoginBody, verifyPasswordResetCode } from '@/services/apis/auth'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants'
import { AxiosError, isAxiosError } from 'axios'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'
import { useGlobalStore } from '@/context/store'
import { getUserDetails } from '@/services/apis/user'
import Link from 'next/link'

export const Login = () => {
  const { setIsLoggedIn, user, setUser } = useGlobalStore()
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [show2fa, setShow2fa] = useState(false)
  const [needsVerify, setNeedsVerify] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/client/overview'
  const invitationToken = searchParams.get('invitation_token')

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      // Check if user data is in store (from previous session)
      if (user?.id) {
        if (user.is_admin) {
          router.push('/admin')
        } else if (user.is_reviewer) {
          router.push('/label/overview')
        } else {
          router.push(returnTo)
        }
        return
      }

      // If no user in store, try to fetch user details
      getUserDetails()
        .then((data) => {
          if (data?.user) {
            if (data.user.is_admin) {
              router.push('/admin')
            } else if (data.user.is_reviewer) {
              router.push('/label/overview')
            } else {
              router.push(returnTo)
            }
          }
        })
        .catch(() => {
          // If fetch fails, token might be invalid, clear it
          localStorage.removeItem(ACCESS_TOKEN_KEY)
          localStorage.removeItem(REFRESH_TOKEN_KEY)
        })
    }
  }, [user, router, returnTo])

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginBody) => {
      const body: LoginBody = {
        username: credentials.username,
        password: credentials.password,
      }
      if (show2fa) {
        body.otp_code = verificationCode
      }
      const response = await login(body)
      return response
    },
    onSuccess: async (data) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
      queryClient.clear()
      setIsLoggedIn(true)
      setUser(data.user_data) // Set user data in global store

      // Auto-accept invitation if token is present
      if (invitationToken) {
        try {
          const { acceptProjectInvitation } = await import(
            '@/services/apis/project'
          )
          await acceptProjectInvitation(invitationToken)
          toast('Login successful', {
            description: 'Welcome back! Invitation accepted.',
          })
          // Redirect will be handled by the invitation acceptance
          return
        } catch (error: any) {
          // If invitation acceptance fails, still proceed with login
          console.error('Failed to accept invitation:', error)
          toast('Login successful', {
            description:
              error?.response?.data?.error || 'Welcome back to Label X',
          })
        }
      } else {
        toast('Login successful', {
          description: 'Welcome back to Label X',
        })
      }

      if (data.user_data.is_admin) {
        router.push('/admin?tab=projects')
      } else if (data.user_data.is_reviewer) {
        router.push('/label/overview')
      } else {
        router.push(returnTo)
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        if (
          err.response?.status === 401 &&
          err.response?.data?.data?.requires_2fa
        ) {
          setShow2fa(true)
          return
        } else if (
          err.response?.status === 401 &&
          err.response?.data?.data?.requires_email_verification
        ) {
          setNeedsVerify(true)
          toast('Email verification required', {
            description:
              'Please enter the verification code sent to your email',
          })
          return
        }
        setError(err.response?.data?.error || err.message)
      } else {
        setError('An unexpected error occurred')
      }
      toast('Login failed', {
        description: 'Please check your credentials and try again',
      })
    },
  })

  const otpMutation = useMutation({
    mutationFn: verifyPasswordResetCode,
    onSuccess: () => {
      setNeedsVerify(false)
      toast('Email verified', {
        description: 'You can now log in with your credentials',
      })
    },
    onError: (err) => {
      if (isAxiosError(err))
        setError(err.response?.data?.error || 'Failed to verify code')
    },
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    loginMutation.mutate({
      username: email,
      password,
      otp_code: verificationCode,
    })
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    otpMutation.mutate({ email, otp: verificationCode })
  }

  return (
    <>
      <form
        onSubmit={needsVerify ? handleOtpVerify : handleLogin}
        className="space-y-4 pt-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email / Username</Label>
          <Input
            id="email"
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-white/10 bg-white/5 text-white"
          />
        </div>

        <div className="relative space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border-white/10 bg-white/5 py-3 pr-12 text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white hover:bg-black/30"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <Link
            href={`/auth/forgot-password?email=${email.includes('@') ? email : ''}`}
            className="absolute right-0 -bottom-7"
          >
            <button
              className="text-primary cursor-pointer text-sm hover:underline"
              type="button"
            >
              Forgot Password
            </button>
          </Link>
        </div>

        {needsVerify && (
          <div>
            <h3 className="mt-8 mb-4">
              Enter the verification code sent to your email
            </h3>
            <div className="mb-10 flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="border-white/10 bg-white/5 text-white"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}

        {show2fa && (
          <div>
            <h3 className="mt-8 mb-4">
              Input the code from your Authenticator app
            </h3>
            <div className="mb-10 flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="border-white/10 bg-white/5 text-white"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}

        <span className="mt-5 mb-2 inline-block text-sm text-red-500">
          {error}
        </span>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 mt-7 h-12 w-full"
          disabled={
            loginMutation.isPending ||
            otpMutation.isPending ||
            (show2fa && verificationCode.length < 6) ||
            (needsVerify && verificationCode.length < 6)
          }
        >
          {otpMutation.isPending
            ? 'Verifying...'
            : loginMutation.isPending
              ? 'Logging in...'
              : 'Login'}
        </Button>
      </form>
      <div className="flex items-end justify-end pb-5">
        Don&#39;t have an account?{' '}
        <Link
          href="/auth/role"
          className="text-primary ml-2 font-semibold hover:underline"
        >
          Register
        </Link>
      </div>
    </>
  )
}

export default Login
