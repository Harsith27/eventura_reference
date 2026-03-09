import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black/90 border-t border-white/10 mt-auto">
      <div className="mx-auto w-full max-w-7xl px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center" aria-label="Home">
            <Image
              src="/branding/logo_dark_no_bg..svg"
              alt="Eventura"
              width={128}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4 text-xs text-white">
            <span>© 2026 Eventura</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white">
            <a className="hover:text-white transition" href="https://x.com" target="_blank" rel="noreferrer">X</a>
            <a className="hover:text-white transition" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a className="hover:text-white transition" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="hover:text-white transition" href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
