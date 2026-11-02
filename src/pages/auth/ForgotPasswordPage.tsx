import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { AuthLayout } from '../../components/brand/AuthLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

interface ResetFields {
  email: string
}

export function ForgotPasswordPage() {
  useDocumentTitle('Reset password')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFields>({ defaultValues: { email: '' }, mode: 'onBlur' })

  const onSubmit = async (values: ResetFields) => {
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    setSentTo(values.email)
    toast.success('Reset link prepared for the demo account.')
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email a reset link to the address on the account."
    >
      {sentTo ? (
        <div>
          <div className="flex items-start gap-3 rounded-[6px] bg-pill-positive-bg px-4 py-3.5">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pill-positive-ink text-pill-positive-bg">
              <Check size={12} strokeWidth={3} />
            </span>
            <div>
              <p className="text-[13px] font-medium text-pill-positive-ink">Check the inbox</p>
              <p className="mt-1 text-[13px] leading-[18px] text-pill-positive-ink/85">
                A reset link for <span className="font-medium">{sentTo}</span> is on its way. The link
                expires in 30 minutes.
              </p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-[18px] text-muted">
            This demo does not send mail. In the real service the link would let the account holder
            choose a new password.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link to="/login" className="btn btn-secondary btn-lg">
              <ArrowLeft size={15} strokeWidth={1.7} />
              Back to sign in
            </Link>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => setSentTo(null)}>
              Use another email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="reset-email" className="field-label">
              Email on the account
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              className="field"
              placeholder="you@dabba.test"
              aria-invalid={Boolean(errors.email)}
              {...register('email', {
                required: 'Enter the email on the account.',
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
          <button type="submit" className="btn btn-primary btn-lg mt-5 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Preparing the link
              </>
            ) : (
              'Send reset link'
            )}
          </button>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} strokeWidth={1.7} />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
