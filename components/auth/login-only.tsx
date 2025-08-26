'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { login, LoginBody } from '@/services/apis/auth'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants'
import { AxiosError } from 'axios'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'
import { useGlobalStore } from '@/context/store'


export const LoginOnly = () => {
  const { setIsLoggedIn } = useGlobalStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [show2fa, setShow2fa] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  //TODO: Implement return USERS based on their roles (client or labeler)
  const returnTo = searchParams.get('returnTo') || '/client/overview'

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
    onSuccess: (data) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
      setIsLoggedIn(true)
      toast('Login successful', {
        description: 'Welcome back to Label X',
      })
      router.push(returnTo)
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        if (
          err.response?.status === 401 &&
          err.response?.data?.data?.requires_2fa
        ) {
          setShow2fa(true)
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

  return (
    <>
    <form onSubmit={handleLogin} className="space-y-4 pt-5">
      <div className="space-y-2">
        <Label htmlFor="email">Username</Label>
        <Input
          id="email"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>

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

      <span className="mb-2 inline-block text-sm text-red-500">{error}</span>
      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90 w-full h-12 mt-3"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
    <div className='pb-5 flex items-end justify-end'>
      Don&#39;t have an account? Contact Support or your organization admin to get started.
    </div>
    </>
  )
}

export default LoginOnly
