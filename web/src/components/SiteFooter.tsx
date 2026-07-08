export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-brand-muted">
        <p className="font-semibold text-white">NicaFlix</p>
        <p className="mt-2 max-w-2xl">
          Plataforma de streaming para Latinoamérica y EE.UU. Descarga la app
          oficial. El contenido embebido respeta las políticas de las fuentes
          originales (YouTube, proveedores con licencia).
        </p>
        <p className="mt-6">© {new Date().getFullYear()} NicaFlix. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
