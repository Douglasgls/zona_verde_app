import { appConfig } from "@/config/app";

export function Footer() {
  return (
    <footer className="mt-6 flex flex-col items-start justify-between gap-2 border-t py-4 text-xs text-muted-foreground md:flex-row md:items-center">
      <p>{appConfig.name} • Monitoramento em tempo real para estacionamento inteligente.</p>
      <a
        href={appConfig.github.url}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-primary hover:underline"
      >
        Repositório do projeto
      </a>
    </footer>
  );
}
