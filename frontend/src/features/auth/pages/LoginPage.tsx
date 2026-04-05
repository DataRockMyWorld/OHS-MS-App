import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/incidents', { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      if (status === 401) {
        setServerError('Invalid email or password. Please try again.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Left panel — brand ───────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-primary-700 flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">OHS-MS</span>
        </div>

        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
            ISO 45001:2018
          </p>
          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Safety management,<br />done right.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            A premium platform for managing occupational health and safety across your
            organization — incidents, investigations, audits, and more.
          </p>
        </div>

        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} OHS-MS. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-700">
              <ShieldCheckIcon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-semibold text-slate-900">OHS-MS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-slate-900 text-2xl">Sign in</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@company.com"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
                <ExclamationCircleIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full justify-center mt-2"
              size="lg"
              loading={isSubmitting}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
