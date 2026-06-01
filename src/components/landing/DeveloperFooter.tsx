import Image from 'next/image';
import Link from 'next/link';

const GithubIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export function DeveloperFooter() {
  return (
    <footer className="relative bg-[#020810] border-t-2 border-[#178582]">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(23,133,130,0.12) 0%, transparent 70%)',
        }}
      />

      {/* ── Main developer section ── */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="flex flex-col items-center text-center gap-10">

          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-[#178582]/50" />
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#178582]">
              Designed &amp; Built by
            </p>
            <div className="h-px w-12 bg-[#178582]/50" />
          </div>

          {/* Profile photo */}
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden ring-4 ring-[#178582] ring-offset-[6px] ring-offset-[#020810] shadow-[0_0_60px_rgba(23,133,130,0.6)]">
              <Image
                src="/profile.png"
                alt="Kamashwara D K"
                width={160}
                height={160}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-400 border-[3px] border-[#020810] shadow-xl" />
          </div>

          {/* Name */}
          <div className="space-y-3">
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none">
              Kamashwara D K
            </h2>
            <p className="text-[#7A9BBF] text-xl sm:text-2xl font-light">
              Full-Stack Developer
            </p>
          </div>

          {/* Message to users */}
          <div className="max-w-2xl bg-[#0D1F35] border border-[#1E3A5F] rounded-2xl px-8 py-6">
            <p className="text-[#B8D0E8] text-base sm:text-lg leading-relaxed">
              Hey there 👋 — I built WorkNest to show what a modern, production-grade team
              productivity platform looks like end-to-end. If you find it useful, have feedback,
              or want to collaborate, feel free to reach out on GitHub or LinkedIn. I&apos;d love
              to hear from you!
            </p>
          </div>

          {/* Tech stack badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Next.js 16', 'TypeScript', 'Supabase', 'tRPC', 'Prisma', 'Tailwind CSS v4', 'Framer Motion'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#0D1F35] border border-[#1E3A5F] text-[#7A9BBF] hover:border-[#178582] hover:text-[#E8F0F8] transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Social links */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="https://github.com/kamashwara-dk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-7 py-4 rounded-xl bg-[#0D1F35] border-2 border-[#1E3A5F] text-[#E8F0F8] hover:border-[#178582] hover:bg-[#112540] hover:shadow-[0_0_24px_rgba(23,133,130,0.35)] transition-all duration-200 font-semibold text-base w-full sm:w-auto justify-center"
              aria-label="GitHub profile"
            >
              <GithubIcon />
              View on GitHub
            </a>
            <a
              href="https://linkedin.com/in/kamashwara-dk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-7 py-4 rounded-xl bg-[#0D1F35] border-2 border-[#1E3A5F] text-[#E8F0F8] hover:border-[#178582] hover:bg-[#112540] hover:shadow-[0_0_24px_rgba(23,133,130,0.35)] transition-all duration-200 font-semibold text-base w-full sm:w-auto justify-center"
              aria-label="LinkedIn profile"
            >
              <LinkedinIcon />
              Connect on LinkedIn
            </a>
          </div>

          {/* WorkNest brand */}
          <div className="flex items-center gap-3 pt-2 opacity-60">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#178582] to-[#0D5250] flex items-center justify-center">
              <span className="font-bold text-white text-sm">W</span>
            </div>
            <span className="font-display font-bold text-white text-lg">
              Work<span className="text-[#178582]">Nest</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-[#1E3A5F]/40 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#7A9BBF]">
          <p>© {new Date().getFullYear()} WorkNest · Built with Next.js, Supabase &amp; tRPC</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#E8F0F8] transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-[#E8F0F8] transition-colors">Get Started Free</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
