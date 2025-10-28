'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { GridBackground } from '@/components/shared/grid-line'
import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from '@/services/apis/auth'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

type Step = 'email' | 'verify-otp' | 'new-password' | 'success'

export default function ForgotPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const emailMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setStep('verify-otp')
    },
    onError: (err) => {
      if (isAxiosError(err))
        setError(err.response?.data?.error || 'Failed to send reset code')
    },
  })

  const otpMutation = useMutation({
    mutationFn: verifyPasswordResetCode,
    onSuccess: () => {
      setStep('new-password')
    },
    onError: (err) => {
      if (isAxiosError(err))
        setError(err.response?.data?.error || 'Failed to verify code')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setStep('success')
    },
    onError: (err) => {
      if (isAxiosError(err))
        setError(err.response?.data?.error || 'Failed to reset password')
    },
  })

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    emailMutation.mutate({ email })
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    // otpMutation.mutate({ email, otp })
    setStep('new-password')
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    passwordMutation.mutate({ email, otp, new_password: newPassword })
  }

  const handleResendCode = async () => {
    setError('')

    try {
      emailMutation.mutate({ email })

      toast('Verification code resent', {
        description: 'Please check your email for the new code',
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code')
    }
  }

  const handleBackToLogin = () => {
    router.back()
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] bg-[url(/auth-bg.jpg)] bg-cover bg-fixed bg-center text-white lg:overflow-hidden">
      <div className="absolute inset-0 bg-black/85" />
      {step === 'email' && (
        <button
          onClick={() => router.back()}
          className="hover:text-primary relative top-6 left-3 z-50 flex cursor-pointer items-center gap-x-2 hover:underline"
        >
          <ArrowLeft /> Back
        </button>
      )}
      <div className="justify-cente m-auto flex h-screen w-full max-w-lg flex-col items-center space-y-6 px-5 pt-10 pb-20">
        <GridBackground />
        {step === 'email' && (
          <>
            <div className="z-10 space-y-2 text-center">
              <div className="from-primary/20 to-primary-glow/20 border-primary/20 inline-flex items-center justify-center rounded-2xl border bg-gradient-to-r p-3 backdrop-blur-sm">
                <Brain className="text-primary h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Forgot Password?
              </h2>
              <p className="text-sm text-white/60">
                Enter your email address and we&#39;ll send you a code to reset
                your password
              </p>
            </div>
            <Card className="max-h-[80vh] w-full border-white/10 bg-white/15 p-6 backdrop-blur-sm md:max-h-none lg:overflow-y-hidden">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>

                {error && (
                  <span className="inline-block text-sm text-red-500">
                    {error}
                  </span>
                )}

                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 h-12 w-full"
                  disabled={emailMutation.isPending}
                >
                  {emailMutation.isPending ? 'Sending...' : 'Send Reset Code'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </form>
            </Card>
          </>
        )}

        {step === 'verify-otp' && (
          <>
            <div className="z-10 space-y-2 text-center">
              <div className="from-primary/20 to-primary-glow/20 border-primary/20 inline-flex items-center justify-center rounded-2xl border bg-gradient-to-r p-3 backdrop-blur-sm">
                <Brain className="text-primary h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verify Code</h2>
              <p className="text-sm text-white/60">
                We&#39;ve sent a 6-digit verification code to <br />
                <span className="font-semibold text-white">{email}</span>
              </p>
            </div>
            <Card className="max-h-[80vh] w-full border-white/10 bg-white/15 p-6 backdrop-blur-sm md:max-h-none lg:overflow-y-hidden">
              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div className="space-y-4">
                  <Label className="block text-center">
                    Enter Verification Code
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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

                {error && (
                  <span className="inline-block text-sm text-red-500">
                    {error}
                  </span>
                )}

                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 h-12 w-full"
                  disabled={otpMutation.isPending || otp.length !== 6}
                >
                  {otpMutation.isPending ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={otpMutation.isPending}
                    className="cursor-pointer text-sm text-white/60 hover:text-white hover:underline disabled:opacity-50"
                  >
                    Didn&#39;t receive the code? Resend
                  </button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                  onClick={() => setStep('email')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Email
                </Button>
              </form>
            </Card>
          </>
        )}

        {step === 'new-password' && (
          <>
            <div className="z-10 space-y-2 text-center">
              <div className="from-primary/20 to-primary-glow/20 border-primary/20 inline-flex items-center justify-center rounded-2xl border bg-gradient-to-r p-3 backdrop-blur-sm">
                <Brain className="text-primary h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Create New Password
              </h2>
              <p className="text-sm text-white/60">
                Your new password must be different from previously used
                passwords
              </p>
            </div>
            <Card className="max-h-[80vh] w-full border-white/10 bg-white/15 p-6 backdrop-blur-sm md:max-h-none lg:overflow-y-hidden">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <p className="text-xs text-white/40">
                    Must be at least 8 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border-white/10 bg-white/5 py-3 pr-12 text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/20 p-1 text-white hover:bg-black/30"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <span className="inline-block text-sm text-red-500">
                    {error}
                  </span>
                )}
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 h-12 w-full"
                  disabled={passwordMutation.isPending}
                >
                  {passwordMutation.isPending
                    ? 'Resetting...'
                    : 'Reset Password'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                  onClick={() => setStep('verify-otp')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to code
                </Button>
              </form>
            </Card>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="z-10 space-y-4 pt-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Password Reset Successful!
              </h2>
              <p className="text-sm text-white/60">
                Your password has been successfully reset. You can now login
                with your new password.
              </p>
            </div>

            <Button
              onClick={handleBackToLogin}
              className="bg-primary hover:bg-primary/90 z-0 h-12 w-full"
            >
              Back to Login
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
