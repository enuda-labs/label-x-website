'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

type Step = 'email' | 'verify-otp' | 'new-password' | 'success'

export default function ForgotPassword() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStep('verify-otp')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStep('new-password')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired code')
    } finally {
      setIsLoading(false)
    }
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

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStep('success')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert('Verification code resent successfully')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <div className="m-auto h-screen w-full max-w-md space-y-6 pt-20">
      {step === 'email' && (
        <>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
            <p className="text-sm text-white/60">
              Enter your email address and we&#39;ll send you a code to reset
              your password
            </p>
          </div>
          <Card className="max-h-[80vh] border-white/10 bg-white/15 p-6 backdrop-blur-sm md:max-h-none lg:overflow-y-hidden">
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
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
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
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white">Verify Code</h2>
            <p className="text-sm text-white/60">
              We&#39;ve sent a 6-digit verification code to <br />
              <span className="font-semibold text-white">{email}</span>
            </p>
          </div>
          <Card className="max-h-[80vh] border-white/10 bg-white/15 p-6 backdrop-blur-sm md:max-h-none lg:overflow-y-hidden">
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
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm text-white/60 hover:text-white hover:underline disabled:opacity-50"
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
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white">
              Create New Password
            </h2>
            <p className="text-sm text-white/60">
              Your new password must be different from previously used passwords
            </p>
          </div>

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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              <span className="inline-block text-sm text-red-500">{error}</span>
            )}

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 h-12 w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </>
      )}

      {step === 'success' && (
        <>
          <div className="space-y-4 text-center">
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
              Your password has been successfully reset. You can now login with
              your new password.
            </p>
          </div>

          <Button
            onClick={handleBackToLogin}
            className="bg-primary hover:bg-primary/90 h-12 w-full"
          >
            Back to Login
          </Button>
        </>
      )}
    </div>
  )
}
