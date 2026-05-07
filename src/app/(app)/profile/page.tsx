'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Mail, Phone, Building2, Briefcase, Save,
  Camera, Globe,
  CheckSquare, Calendar, FileText, Edit3, Link2,
  Shield, Clock,
} from 'lucide-react';

// Social brand SVG icons (lucide-react doesn't include brand icons)
const LinkedinIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GithubIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
import { trpc } from '@/lib/trpc/client';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  designation: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(300).optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const roleColors: Record<string, string> = {
  ADMIN: 'text-red-400 bg-red-400/10 border-red-400/20',
  MANAGER: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  EMPLOYEE: 'text-[#178582] bg-[#178582]/10 border-[#178582]/20',
};

// ── Avatar Upload Component ──────────────────────────────────────────────────
function AvatarUpload({
  currentAvatar,
  userName,
  onUpload,
}: {
  currentAvatar?: string | null;
  userName: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayAvatar =
    preview ??
    currentAvatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=178582&color=fff&size=128`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const supabase = createClient();

      // Get current user id for the file path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast.success('Avatar updated!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      // Fallback: use a generated avatar URL with the file name as seed
      toast.error(`Storage upload failed: ${msg}. Using generated avatar instead.`);
      // Keep the preview but generate a stable URL
      const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=178582&color=fff&size=128&t=${Date.now()}`;
      onUpload(fallbackUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className="relative w-24 h-24 cursor-pointer group"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => inputRef.current?.click()}
      >
        <img
          src={displayAvatar}
          alt={userName}
          className="w-24 h-24 rounded-full object-cover border-2 border-[#178582] transition-all duration-200 group-hover:border-[#178582]/60"
        />

        {/* Overlay on hover */}
        <AnimatePresence>
          {(hovering || uploading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center gap-1"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Camera size={18} className="text-white" />
                  <span className="text-white text-[10px] font-medium">Change</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#BFA181] border-2 border-[#0A1828]" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs text-zinc-500 text-center mt-2">
        Click to change · Max 5MB
      </p>
    </div>
  );
}

// ── Social Link Input ────────────────────────────────────────────────────────
function SocialInput({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  color,
}: {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
        <Icon size={13} className={color} />
        {label}
      </label>
      <div className="relative">
        <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-[#0D1F35] border border-[#1E3A5F] text-white placeholder-zinc-600 focus:outline-none focus:border-[#178582] text-sm transition-colors"
        />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const utils = trpc.useUtils();
  const { data: meData, isLoading } = trpc.users.me.useQuery();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bioCount, setBioCount] = useState(0);

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile saved!');
      utils.users.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const bioValue = watch('bio') ?? '';

  useEffect(() => {
    setBioCount(bioValue.length);
  }, [bioValue]);

  useEffect(() => {
    if (meData) {
      reset({
        name: meData.name,
        designation: meData.designation ?? '',
        department: meData.department ?? '',
        phone: meData.phone ?? '',
        bio: meData.bio ?? '',
        linkedinUrl: meData.linkedinUrl ?? '',
        twitterUrl: meData.twitterUrl ?? '',
        githubUrl: meData.githubUrl ?? '',
        websiteUrl: meData.websiteUrl ?? '',
      });
      setAvatarUrl(meData.avatar ?? null);
    }
  }, [meData, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate({
      ...data,
      avatar: avatarUrl ?? undefined,
    });
  };

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
    // Immediately persist the new avatar
    updateProfile.mutate({ avatar: url });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-[#0D1F35] rounded-lg" />
        <div className="h-48 bg-[#0D1F35] rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#0D1F35] rounded-xl" />)}
        </div>
        <div className="h-96 bg-[#0D1F35] rounded-xl" />
      </div>
    );
  }

  const socialLinks = [
    { key: 'linkedinUrl', icon: LinkedinIcon, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname', color: 'text-blue-400' },
    { key: 'twitterUrl', icon: TwitterIcon, label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle', color: 'text-sky-400' },
    { key: 'githubUrl', icon: GithubIcon, label: 'GitHub', placeholder: 'https://github.com/yourusername', color: 'text-zinc-300' },
    { key: 'websiteUrl', icon: Globe, label: 'Website', placeholder: 'https://yourwebsite.com', color: 'text-[#BFA181]' },
  ] as const;

  // Build display social links from current data
  const currentSocials = {
    linkedinUrl: meData?.linkedinUrl,
    twitterUrl: meData?.twitterUrl,
    githubUrl: meData?.githubUrl,
    websiteUrl: meData?.websiteUrl,
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your identity and public presence</p>
      </motion.div>

      {/* ── Hero card ── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-[#1E3A5F]"
        style={{ background: 'linear-gradient(135deg, rgba(23,133,130,0.08) 0%, rgba(191,161,129,0.04) 100%)' }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(23,133,130,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(191,161,129,0.1) 0%, transparent 50%)',
          }}
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar upload */}
            <AvatarUpload
              currentAvatar={avatarUrl ?? meData?.avatar}
              userName={meData?.name ?? 'User'}
              onUpload={handleAvatarUpload}
            />

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-2xl font-bold text-white">{meData?.name}</h2>
              <p className="text-zinc-400 text-sm mt-0.5">
                {meData?.designation ?? 'Team Member'}
                {meData?.department && (
                  <span className="text-zinc-600"> · {meData.department}</span>
                )}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${roleColors[meData?.role ?? 'EMPLOYEE']}`}>
                  {meData?.role}
                </span>
                {meData?.isActive && (
                  <span className="text-xs px-2.5 py-1 rounded-full border text-[#BFA181] bg-[#BFA181]/10 border-[#BFA181]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BFA181] animate-pulse" />
                    Active
                  </span>
                )}
              </div>

              {/* Bio preview */}
              {meData?.bio && (
                <p className="text-zinc-400 text-sm mt-3 max-w-md leading-relaxed">
                  {meData.bio}
                </p>
              )}

              {/* Social links display */}
              <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
                {currentSocials.linkedinUrl && (
                  <a href={currentSocials.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#112540] border border-[#1E3A5F] text-blue-400 hover:bg-blue-400/10 transition-colors">
                    <LinkedinIcon size={15} />
                  </a>
                )}
                {currentSocials.twitterUrl && (
                  <a href={currentSocials.twitterUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#112540] border border-[#1E3A5F] text-sky-400 hover:bg-sky-400/10 transition-colors">
                    <TwitterIcon size={15} />
                  </a>
                )}
                {currentSocials.githubUrl && (
                  <a href={currentSocials.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#112540] border border-[#1E3A5F] text-zinc-300 hover:bg-white/5 transition-colors">
                    <GithubIcon size={15} />
                  </a>
                )}
                {currentSocials.websiteUrl && (
                  <a href={currentSocials.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#112540] border border-[#1E3A5F] text-[#BFA181] hover:bg-[#BFA181]/10 transition-colors">
                    <Globe size={15} />
                  </a>
                )}
                {!currentSocials.linkedinUrl && !currentSocials.twitterUrl && !currentSocials.githubUrl && !currentSocials.websiteUrl && (
                  <p className="text-xs text-zinc-600 italic">No social links added yet</p>
                )}
              </div>
            </div>

            {/* Account meta */}
            <div className="hidden sm:flex flex-col gap-2 text-right text-xs text-zinc-500 flex-shrink-0">
              <div className="flex items-center gap-1.5 justify-end">
                <Clock size={11} />
                <span>Joined {meData?.joinedAt ? format(new Date(meData.joinedAt), 'MMM yyyy') : '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Mail size={11} />
                <span className="max-w-[180px] truncate">{meData?.email}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Shield size={11} />
                <span>{meData?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tasks', value: meData?._count?.tasks ?? 0, icon: CheckSquare, color: 'text-[#178582]', bg: 'bg-[#178582]/10' },
          { label: 'Leave Requests', value: meData?._count?.leaveRequests ?? 0, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Documents', value: meData?._count?.documents ?? 0, icon: FileText, color: 'text-[#BFA181]', bg: 'bg-[#BFA181]/10' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center border border-[#1E3A5F] bg-[#0D1F35]">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon size={15} className={stat.color} />
            </div>
            <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-zinc-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Edit form ── */}
      <motion.div variants={fadeUp}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Personal info card */}
          <div className="rounded-xl border border-[#1E3A5F] bg-[#0D1F35] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1E3A5F]">
              <Edit3 size={15} className="text-[#178582]" />
              <h2 className="font-display font-semibold text-white text-sm">Personal Information</h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-zinc-400" />
                  Full Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0A1828] border border-[#1E3A5F] text-white placeholder-zinc-600 focus:outline-none focus:border-[#178582] text-sm transition-colors"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-zinc-400" />
                  Designation
                </label>
                <input
                  {...register('designation')}
                  placeholder="e.g. Senior Engineer"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0A1828] border border-[#1E3A5F] text-white placeholder-zinc-600 focus:outline-none focus:border-[#178582] text-sm transition-colors"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={13} className="text-zinc-400" />
                  Department
                </label>
                <input
                  {...register('department')}
                  placeholder="e.g. Engineering"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0A1828] border border-[#1E3A5F] text-white placeholder-zinc-600 focus:outline-none focus:border-[#178582] text-sm transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-zinc-400" />
                  Phone
                </label>
                <input
                  {...register('phone')}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0A1828] border border-[#1E3A5F] text-white placeholder-zinc-600 focus:outline-none focus:border-[#178582] text-sm transition-colors"
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Edit3 size={13} className="text-zinc-400" />
                    Bio
                  </span>
                  <span className={`text-xs ${bioCount > 280 ? 'text-red-400' : 'text-zinc-600'}`}>
                    {bioCount}/300
                  </span>
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  placeholder="Tell your team a bit about yourself..."
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0A1828] border border-[#1E3A5F] text-white placeholder-zinc-600 focus:outline-none focus:border-[#178582] text-sm transition-colors resize-none"
                />
                {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
              </div>
            </div>
          </div>

          {/* Social links card */}
          <div className="rounded-xl border border-[#1E3A5F] bg-[#0D1F35] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1E3A5F]">
              <Link2 size={15} className="text-[#BFA181]" />
              <h2 className="font-display font-semibold text-white text-sm">Social Links</h2>
              <span className="ml-auto text-xs text-zinc-600">Visible on your team profile</span>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialLinks.map(({ key, icon, label, placeholder, color }) => (
                <SocialInput
                  key={key}
                  icon={icon}
                  label={label}
                  placeholder={placeholder}
                  color={color}
                  value={watch(key as keyof ProfileFormData) as string ?? ''}
                  onChange={(v) => setValue(key as keyof ProfileFormData, v, { shouldDirty: true })}
                />
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-between">
            {isDirty && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-amber-400 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Unsaved changes
              </motion.p>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:shadow-[0_0_20px_rgba(23,133,130,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, #178582 0%, #1EAAA7 50%, #178582 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }}
              >
                {updateProfile.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* ── Account info ── */}
      <motion.div variants={fadeUp} className="rounded-xl border border-[#1E3A5F] bg-[#0D1F35] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1E3A5F]">
          <Shield size={15} className="text-zinc-400" />
          <h2 className="font-display font-semibold text-white text-sm">Account Information</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { icon: Mail, label: 'Email address', value: meData?.email },
            { icon: Shield, label: 'Role', value: meData?.role },
            { icon: Clock, label: 'Member since', value: meData?.joinedAt ? format(new Date(meData.joinedAt), 'MMMM d, yyyy') : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-[#0A1828] border border-[#1E3A5F]/50">
              <div className="w-8 h-8 rounded-lg bg-[#112540] flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
