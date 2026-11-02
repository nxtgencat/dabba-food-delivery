import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { AuthLayout } from '../../components/brand/AuthLayout'
import { useAuth } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

interface RegisterFields {
  name: string
  email: string
  phone: string
  password: string
  confirm: string
  terms: boolean
}

const strengthOf = (password: string) => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

export function RegisterPage() {
  useDocumentTitle('Create an account')
  const { register: create } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    defaultValues: { name: '', email: '', phone: '', password: '', confirm: '', terms: false },
    mode: 'onBlur',
  })

  const password = watch('password')
  const strength = strengthOf(password)

  const onSubmit = async (values: RegisterFields) => {
    const result = await create({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
    })
    if (!result.ok) {
      if (result.error === 'exists') {
        setError('email', { message: 'An account with this email already exists.' })
      } else {
        toast.error('The account could not be created.')
      }
      return
    }
    toast.success('Account created. Welcome to the service.')
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register a shift lead for the evening. You can change every detail on the profile page."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input
            id="name"
            className="field"
            autoComplete="name"
            placeholder="Maya Deshpande"
            aria-invalid={Boolean(errors.name)}
            {...register('name', {
              required: 'Enter the name the team will see.',
              minLength: { value: 3, message: 'Use at least three characters.' },
            })}
          />
          {errors.name ? (
            <p className="field-error" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field"
              autoComplete="email"
              placeholder="you@dabba.test"
              aria-invalid={Boolean(errors.email)}
              {...register('email', {
                required: 'Enter an email address.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                  message: 'Use a complete email address.',
                },
              })}
            />
            {errors.email ? (
              <p className="field-error" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="phone" className="field-label">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              className="field"
              autoComplete="tel"
              placeholder="+91 98200 12345"
              aria-invalid={Boolean(errors.phone)}
              {...register('phone', {
                required: 'A number is needed for delivery updates.',
                pattern: {
                  value: /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
                  message: 'Use a 10-digit Indian mobile number.',
                },
              })}
            />
            {errors.phone ? (
              <p className="field-error" role="alert">
                {errors.phone.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3.5">
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="field pr-11"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-help"
              {...register('password', {
                required: 'Choose a password.',
                minLength: { value: 8, message: 'Use at least 8 characters.' },
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
          <div className="mt-2 flex items-center gap-2" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  strength > index ? (strength >= 3 ? 'bg-positive' : 'bg-warning') : 'bg-sunken'
                }`}
              />
            ))}
          </div>
          <p id="password-help" className="mt-1.5 text-[13px] leading-4 text-faint">
            {password
              ? strength >= 3
                ? 'Strong enough for the service.'
                : 'Mix upper and lower case with a number.'
              : 'At least 8 characters, with a number and a capital.'}
          </p>
          {errors.password ? (
            <p className="field-error" role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="mt-3.5">
          <label htmlFor="confirm" className="field-label">
            Repeat password
          </label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            className="field"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirm)}
            {...register('confirm', {
              required: 'Repeat the password.',
              validate: (value) => value === password || 'The two passwords do not match.',
            })}
          />
          {errors.confirm ? (
            <p className="field-error" role="alert">
              {errors.confirm.message}
            </p>
          ) : null}
        </div>

        <label className="mt-4 flex items-start gap-2 text-[13px] leading-[18px] text-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-3.5 w-3.5 accent-[var(--color-ink)]"
            {...register('terms', { required: 'Accept the terms to continue.' })}
          />
          <span>I understand this is a demonstration and no real order or payment is placed.</span>
        </label>
        {errors.terms ? (
          <p className="field-error" role="alert">
            {errors.terms.message}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary btn-lg mt-5 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating the account
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-4 text-[13px] leading-4 text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-ink underline decoration-control underline-offset-2">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
