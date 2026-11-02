import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { AuthLayout } from '../../components/brand/AuthLayout'
import { useAuth } from '../../hooks/useApp'
import { demoCredentials } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

interface LoginFields {
  email: string
  password: string
  remember: boolean
}

export function LoginPage() {
  useDocumentTitle('Sign in')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    defaultValues: { email: '', password: '', remember: true },
    mode: 'onBlur',
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const onSubmit = async (values: LoginFields) => {
    const result = await signIn(values.email, values.password, values.remember)
    if (!result.ok) {
      setError('password', { message: 'That email and password do not match an account.' })
      toast.error('Sign-in failed. Check the email and password.')
      return
    }
    toast.success('Signed in. Tonight’s service is on the board.')
    navigate(from, { replace: true })
  }

  const fillDemo = () => {
    setValue('email', demoCredentials.email, { shouldValidate: true })
    setValue('password', demoCredentials.password, { shouldValidate: true })
  }

  return (
    <AuthLayout
      title="Sign in to the dinner board"
      subtitle="One account runs the evening service, the menu and the customer flows."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4 flex items-start justify-between gap-3 rounded-[6px] bg-sunken px-3 py-2.5">
          <div>
            <p className="text-[13px] leading-4 font-medium">Demo manager account</p>
            <p className="mt-0.5 text-[13px] leading-4 text-muted">
              {demoCredentials.email} · {demoCredentials.password}
            </p>
          </div>
          <button type="button" onClick={fillDemo} className="btn btn-secondary btn-sm shrink-0">
            Use it
          </button>
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@dabba.test"
            className="field"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              required: 'Enter the email you signed up with.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                message: 'That does not look like an email address.',
              },
            })}
          />
          {errors.email ? (
            <p id="email-error" className="field-error" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="mt-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="field-label mb-0">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] leading-4 text-muted transition-colors hover:text-ink"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="At least 8 characters"
              className="field pr-11"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password', {
                required: 'Enter your password.',
                minLength: { value: 8, message: 'Passwords are at least 8 characters.' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-1 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[4px] text-faint transition-colors hover:bg-raised hover:text-ink"
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="field-error" role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <fieldset className="mt-4">
          <legend className="field-label">Where the session is kept</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-[6px] px-3 py-2.5 text-[13px] shadow-[inset_0_0_0_1px_var(--color-line)] has-[:checked]:bg-active has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-ink)]">
              <input
                type="radio"
                value="device"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-ink)]"
                {...register('remember')}
              />
              <span>
                <span className="block font-medium">This device</span>
                <span className="mt-0.5 block text-[12px] leading-4 text-muted">
                  Stay signed in after the tab closes.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-[6px] px-3 py-2.5 text-[13px] shadow-[inset_0_0_0_1px_var(--color-line)] has-[:checked]:bg-active has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-ink)]">
              <input
                type="radio"
                value="tab"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-ink)]"
                {...register('remember', { setValueAs: (value) => value === 'device' })}
              />
              <span>
                <span className="block font-medium">This tab</span>
                <span className="mt-0.5 block text-[12px] leading-4 text-muted">
                  Sign out when the tab closes.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary btn-lg mt-5 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-4 text-[13px] leading-4 text-muted">
        New to the service?{' '}
        <Link to="/register" className="font-medium text-ink underline decoration-control underline-offset-2">
          Create an account
        </Link>
      </p>

      <div className="mt-7 border-t border-line pt-4">
        <p className="text-[13px] leading-4 text-faint">
          This is a demonstration build. Accounts, baskets and orders stay in this browser’s local
          storage, and no payment is ever taken.
        </p>
      </div>
    </AuthLayout>
  )
}
