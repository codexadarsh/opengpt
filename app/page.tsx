import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Github,
  BookOpen,
  Sparkles,
  History,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              OpenGPT
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/docs"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/codexadarsh/opengpt"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>

            <Button asChild>
              <Link href="/chat">Start Chat</Link>
            </Button>
          </nav>

          {/* Mobile CTA only (simple, no hamburger UI bloat) */}
          <div className="md:hidden">
            <Button size="sm" asChild>
              <Link href="/chat">Start</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs text-muted-foreground">
              <Check className="h-4 w-4" />
              Unified UI • Multi-model • Self-hostable
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              One chat UI.
              <br />
              All major AI models.
            </h1>

            <p className="mt-5 text-base text-muted-foreground md:text-lg">
              OpenGPT is an open-source, unified chat interface for GPT models,
              Claude, Gemini, Grok, and open-source models. Switch
              instantly—without switching tools.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/chat">Start chatting</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/docs" className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  How it works
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>• Switch models per message</span>
              <span>• One shared history</span>
              <span>• Run locally</span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="mt-14">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/40" />
              <Image
                src="/hero.png"
                alt="OpenGPT unified chat interface"
                width={1400}
                height={800}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Sparkles className="h-4 w-4" />}
            title="Multi-model conversations"
            description="Switch between providers inside the same UI—per message, per chat, or per workflow."
          />
          <Feature
            icon={<Shield className="h-4 w-4" />}
            title="Open-source & self-hosted"
            description="No lock-in. Run locally, deploy on your infra, and control your data + keys."
          />
          <Feature
            icon={<History className="h-4 w-4" />}
            title="Unified chat history"
            description="One timeline across models. Stop juggling tabs and fragmented histories."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {year} OpenGPT · MIT License</span>
          <span>
            Built by{" "}
            <a
              href="https://github.com/codexadarsh"
              target="_blank"
              className="underline hover:text-foreground"
            >
              codexadarsh
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary p-6">
      <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background">
        {icon}
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
