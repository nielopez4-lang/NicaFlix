import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-brand-dark/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="NicaFlix" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-bold tracking-tight">
            Nica<span className="text-brand-red">Flix</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-brand-muted md:flex">
          <Link href="/catalogo" className="hover:text-white">
            Catálogo
          </Link>
          <Link href="/envivo" className="hover:text-white">
            En Vivo
          </Link>
          <Link href="/deportes" className="hover:text-white">
            Deportes
          </Link>
        </nav>
        <a
          href="/#descargar"
          className="rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Descargar
        </a>
      </div>
    </header>
  );
}
