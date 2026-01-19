'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, Check, X, CheckSquare2Icon, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  register,
  verifyPasswordResetCode,
  resendVerificationEmail,
} from '@/services/apis/auth'
import { AxiosError, isAxiosError } from 'axios'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants'
import Link from 'next/link'
import { listReviewersDomains } from '@/services/apis/reviewers'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'

export const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState<number[]>([])
  const [isDomainsOpen, setIsDomainsOpen] = useState(false)
  const [needsVerify, setNeedsVerify] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  const roleParam = searchParams.get('role')
  const invitationToken = searchParams.get('invitation_token')
  const isInvitedUser = !!invitationToken

  // Default to 'individual' (client) role if there's an invitation token but no role specified
  const role = roleParam || (invitationToken ? 'individual' : null)

  const MAX_DOMAINS = 5

  // Password validation rules
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const isClient = role === 'individual'
  const isLabeler = role === 'labeler'

  const { data: domains } = useQuery({
    queryKey: ['labeler_domains'],
    queryFn: listReviewersDomains,
    enabled: isLabeler,
  })

  useEffect(() => {
    // Don't redirect invited users - they don't need role selection
    if (isInvitedUser) return

    // Redirect to role selection if role is missing or invalid
    if (!role || (role !== 'individual' && role !== 'labeler')) {
      router.push('/auth/role')
    }
  }, [router, role, isInvitedUser])

  const signupMutation = useMutation({
    mutationFn: async (userData: {
      email: string
      password: string
      name: string
      company: string
    }) => {
      // For invited users, always use 'organization' role (they're joining an existing org)
      const userRole = isInvitedUser
        ? 'organization'
        : isLabeler
          ? 'reviewer'
          : 'organization'
      const response = await register({
        username: userData.name,
        email: userData.email,
        password: userData.password,
        role: userRole,
        domains: isInvitedUser ? [] : selectedDomains, // Invited users don't need domains
        invitation_token: invitationToken || undefined,
      })
      return response
    },
    onSuccess: (data) => {
      if (data.status === 'success') {
        setNeedsVerify(true)
        toast('Account created successfully', {
          description: invitationToken
            ? 'Welcome to Label X! Your invitation will be accepted after email verification.'
            : 'Welcome to Label X',
        })
        // If invitation token exists, it will be handled after email verification
        // The backend should auto-accept the invitation after registration
      } else {
        toast('Signup failed', {
          description: 'Please try again later',
        })
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        const errorMsg = err.response?.data?.error || err.message
        setError(errorMsg)
        toast.error('Signup failed', {
          description: errorMsg,
          duration: 10000,
          className: 'text-white [&>div]:text-white',
        })
      } else {
        setError('An unexpected error occurred')
        toast.error('Signup failed', {
          description: 'Please try again later',
          duration: 10000,
          className: 'text-white [&>div]:text-white',
        })
      }
    },
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // For invited users, skip role validation
    if (!isInvitedUser) {
      if (!isClient && !isLabeler) return router.push('/auth/role')
    }

    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements')
      setPasswordTouched(true)
      return
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    signupMutation.mutate({ email, password, name, company })
  }

  const handleDomainToggle = (domainId: number) => {
    setSelectedDomains((prev) => {
      if (prev.includes(domainId)) {
        return prev.filter((id) => id !== domainId)
      } else {
        if (prev.length >= MAX_DOMAINS) {
          toast('Maximum domains reached', {
            description: `You can select up to ${MAX_DOMAINS} fields`,
          })
          return prev
        }
        return [...prev, domainId]
      }
    })
  }

  const getSelectedDomainsText = () => {
    if (selectedDomains.length === 0) return 'Select Fields'
    if (selectedDomains.length) {
      return selectedDomains
        .map((domain) => domains?.find((d) => d.id === domain)?.domain)
        .toString()
        .replaceAll(',', ', ')
    }
    return 'Select Fields'
  }

  const ValidationIcon = ({ isValid }: { isValid: boolean }) =>
    isValid ? (
      <Check size={16} className="text-green-500" />
    ) : (
      <X size={16} className="text-red-500" />
    )

  const otpMutation = useMutation({
    mutationFn: verifyPasswordResetCode,
    onSuccess: () => {
      toast('Email verified', {
        description: 'You can now log in with your credentials',
      })
      router.push('/auth/login')
    },
    onError: (err) => {
      if (isAxiosError(err))
        setError(err.response?.data?.error || 'Failed to verify code')
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => resendVerificationEmail({ email }),
    onSuccess: () => {
      setResendCooldown(60) // Start 1-minute cooldown
      toast.success('Verification code resent', {
        description: 'Please check your email for the new code',
        duration: 5000,
      })
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const errorMsg =
          err.response?.data?.error || 'Failed to resend verification code'
        setError(errorMsg)
        toast.error('Failed to resend code', {
          description: errorMsg,
          duration: 10000,
          className: 'text-white [&>div]:text-white',
        })
      }
    },
  })

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Start cooldown when verification step is shown
  useEffect(() => {
    if (needsVerify) {
      setResendCooldown(60) // Start with 1-minute cooldown
    }
  }, [needsVerify])

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    otpMutation.mutate({ email, otp: verificationCode })
  }

  return needsVerify ? (
    <form onSubmit={handleOtpVerify} className="space-y-4">
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
      <span className="mb-2 inline-block text-sm text-red-500">{error}</span>
      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90 h-12 w-full"
        disabled={otpMutation.isPending || verificationCode.length < 6}
      >
        {otpMutation.isPending ? 'Verifying...' : 'Verify Account'}
      </Button>
      <div className="mt-4 flex items-center justify-center gap-2">
        <p className="text-sm text-white/60">Didn't receive the code?</p>
        <Button
          type="button"
          variant="link"
          onClick={() => resendMutation.mutate()}
          disabled={resendCooldown > 0 || resendMutation.isPending}
          className="text-primary hover:text-primary/80 h-auto p-0 text-sm font-normal"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : resendMutation.isPending
              ? 'Sending...'
              : 'Resend code'}
        </Button>
      </div>
    </form>
  ) : isInvitedUser ? (
    <>
      <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-white/80">
          You've been invited to join an existing organization. Please create
          your account to accept the invitation.
        </p>
      </div>
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Username *</Label>
          <Input
            id="name"
            type="text"
            placeholder="johndoe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-white/10 bg-white/5 text-white"
          />
          <p className="mt-1 text-xs text-white/60">
            Choose a unique username (no spaces recommended)
          </p>
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
          <p className="mt-1 text-xs text-white/60">
            Use the email address you were invited with
          </p>
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

        <span className="mb-2 inline-block text-sm text-red-500">{error}</span>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 h-12 w-full"
          disabled={signupMutation.isPending || !isPasswordValid}
        >
          {signupMutation.isPending
            ? 'Creating account...'
            : 'Create Account & Join'}
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
  ) : (
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
        {isClient && (
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
        )}
        {isLabeler && (
          <div className="space-y-2">
            <Label>Fields * (Max {MAX_DOMAINS})</Label>
            <Select open={isDomainsOpen} onOpenChange={setIsDomainsOpen}>
              <SelectTrigger
                className="w-full border-white/10 bg-white/5"
                style={{ height: 44 }}
              >
                <SelectValue placeholder={getSelectedDomainsText()} />
              </SelectTrigger>
              <SelectContent>
                <div className="space-y-2 p-2">
                  {domains?.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-white/5"
                      onClick={() => handleDomainToggle(domain.id)}
                    >
                      {selectedDomains.includes(domain.id) ? (
                        <CheckSquare2Icon
                          onClick={() => handleDomainToggle(domain.id)}
                          className="border-gray-500 data-[state=checked]:border-[#d45c08] data-[state=checked]:bg-[#d45c08]"
                        />
                      ) : (
                        <Square
                          onClick={() => handleDomainToggle(domain.id)}
                          className="border-gray-500 data-[state=checked]:border-[#d45c08] data-[state=checked]:bg-[#d45c08]"
                        />
                      )}
                      <label className="flex-1 cursor-pointer text-sm">
                        {domain.domain}
                      </label>
                    </div>
                  ))}
                </div>
              </SelectContent>
            </Select>
            {selectedDomains.length > 0 && (
              <div className="text-xs text-white/60">
                {selectedDomains.length} of {MAX_DOMAINS} fields selected
              </div>
            )}
          </div>
        )}
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
          disabled={
            signupMutation.isPending ||
            !isPasswordValid ||
            (isLabeler && !selectedDomains.length)
          }
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
