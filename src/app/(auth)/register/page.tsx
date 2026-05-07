'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { scaleIn, fadeUp, staggerContainer } from '@/lib/animations';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  department: z.string().min(1, 'Please select a department'),
  terms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const departments = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'HR', 'Finance', 'Operations', 'Legal', 'Customer Success',
];

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : 'bg-[#152B4A]'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-amber-400' : strength === 3 ? 'text-blue-400' : 'text-green-400'}`}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            department: data.department,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (authData.user) {
        // Create user in DB via API
        await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseId: authData.user.id,
            email: data.email,
            name: data.name,
            department: data.department,
          }),
        });

        toast.success('Account created! Welcome to WorkNest 🎉');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          toast.error('Google login is not configured yet. Please use email/password or contact your admin.');
        } else {
          toast.error(error.message);
        }
      }
    } catch {
      toast.error('Google login failed. Please try email/password instead.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface items-center justify-center p-12">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(23,133,130,0.3) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,161,129,0.2) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow-primary">
              <span className="font-display font-bold text-white">W</span>
            </div>
            <span className="font-display font-bold text-white text-2xl">
              Work<span className="text-primary">Nest</span>
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Join 500+ teams already using WorkNest
          </h2>
          <p className="text-zinc-400 mb-8">
            Set up your workspace in under 2 minutes.
          </p>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm">1</span>
              </div>
              <span className="text-zinc-300 text-sm">Create your account</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#152B4A] flex items-center justify-center">
                <span className="text-zinc-500 text-sm">2</span>
              </div>
              <span className="text-zinc-500 text-sm">Invite your team</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#152B4A] flex items-center justify-center">
                <span className="text-zinc-500 text-sm">3</span>
              </div>
              <span className="text-zinc-500 text-sm">Start collaborating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">W</span>
            </div>
            <span className="font-display font-bold text-white text-xl">
              Work<span className="text-primary">Nest</span>
            </span>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h1 variants={fadeUp} className="font-display text-3xl font-bold text-white mb-2">
              Create your account
            </motion.h1>
            <motion.p variants={fadeUp} className="text-zinc-400 mb-8">
              Free forever for teams up to 10 members
            </motion.p>

            {/* Google OAuth */}
            <motion.button
              variants={fadeUp}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface hover:bg-[#112540] text-white font-medium transition-all duration-200 mb-6 disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width={18} height={18} viewBox="0 0 24 24" className="text-zinc-400">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </motion.button>

            <motion.div variants={fadeUp} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-background text-zinc-500">or continue with email</span>
              </div>
            </motion.div>

            <motion.form variants={staggerContainer} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </motion.div>

              {/* Email */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </motion.div>

              {/* Department */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Department</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <select
                    {...register('department')}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="" className="bg-surface">Select department</option>
                    {departments.map((d) => (
                      <option key={d} value={d} className="bg-surface">{d}</option>
                    ))}
                  </select>
                </div>
                {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
              </motion.div>

              {/* Password */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-10 py-3 rounded-xl bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fadeUp}>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-10 py-3 rounded-xl bg-surface border border-border text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </motion.div>

              {/* Terms */}
              <motion.div variants={fadeUp} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  {...register('terms')}
                  className="w-4 h-4 mt-0.5 rounded border-border bg-surface text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-zinc-400">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </motion.div>
              {errors.terms && <p className="text-red-400 text-xs">{errors.terms.message}</p>}

              {/* Submit */}
              <motion.button
                variants={fadeUp}
                type="submit"
                disabled={loading}
                className="w-full shimmer-btn text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-glow-primary hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </motion.form>

            <motion.p variants={fadeUp} className="text-center text-zinc-500 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
