import Image from 'next/image';
import Link from 'next/link';

const GithubIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export function DeveloperFooter() {
  return (
    <footer className="bg-[#030B14] border-t-2 border-[#178582]/40">
      {/* ── Developer hero strip ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col items-center text-center gap-8">

          {/* Label */}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#178582]">
            Designed &amp; Built by
          </p>

          {/* Profile picture */}
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-[#178582] ring-offset-4 ring-offset-[#030B14] shadow-[0_0_40px_rgba(23,133,130,0.5)]">
              <Image
                src="/profile.png"
                alt="Kamashwara D K"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-400 border-[3px] border-[#030B14] shadow-lg" />
          </div>

          {/* Name + title */}
          <div className="space-y-2">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Kamashwara D K
            </h2>
            <p className="text-[#7A9BBF] text-lg">
              Full-Stack Developer
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {['Next.js', 'TypeScript', 'Supabase', 'tRPC', 'Prisma', 'Tailwind CSS'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#0D1F35] border border-[#1E3A5F] text-[#7A9BBF]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/kamashwara-dk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#0D1F35] border border-[#1E3A5F] text-[#E8F0F8] hover:border-[#178582] hover:bg-[#112540] hover:shadow-[0_0_16px_rgba(23,133,130,0.3)] transition-all duration-200 font-medium text-sm"
              aria-label="GitHub profile"
            >
              <GithubIcon />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/kamashwara-dk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#0D1F35] border border-[#1E3A5F] text-[#E8F0F8] hover:border-[#178582] hover:bg-[#112540] hover:shadow-[0_0_16px_rgba(23,133,130,0.3)] transition-all duration-200 font-medium text-sm"
              aria-label="LinkedIn profile"
            >
              <LinkedinIcon />
              LinkedIn
            </a>
          </div>

          {/* WorkNest brand */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#178582] to-[#0D5250] flex items-center justify-center shadow-[0_0_16px_rgba(23,133,130,0.4)]">
              <span className="font-bold text-white text-base">W</span>
            </div>
            <span className="font-display font-bold text-white text-xl">
              Work<span className="text-[#178582]">Nest</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[#1E3A5F]/60 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#7A9BBF]">
          <p>© {new Date().getFullYear()} WorkNest · Built with Next.js, Supabase &amp; tRPC</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#E8F0F8] transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-[#E8F0F8] transition-colors">Get Started</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
