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
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border bg-secondary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight">OpenGPT</span>
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/docs"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Docs
            </Link>

            <Link
              href="https://github.com/codexadarsh/opengpt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>

            <Button asChild>
              <Link href="/chat">Start Chat</Link>
            </Button>
          </nav>

          <div className="md:hidden">
            <Button size="sm" asChild>
              <Link href="/chat">Start</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-2 text-xs text-muted-foreground">
            <Check className="h-4 w-4" />
            Unified UI • Multi-model • Self-hostable
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl leading-tight">
            Stop switching tools.
            <br />
            <span className="text-primary">Use every AI in one place.</span>
          </h1>

          <p className="mt-5 text-muted-foreground md:text-lg max-w-xl mx-auto">
            OpenGPT brings GPT, Claude, Gemini, Grok, and open models into a
            single interface. Faster workflow, zero friction.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/chat">Start chatting</Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/docs" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                How it works
              </Link>
            </Button>
          </div>

          {/* Preview */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl overflow-hidden border bg-secondary">
            <Image
              src="/hero1.png"
              alt="OpenGPT UI preview"
              width={1400}
              height={800}
              priority
              className="w-full h-auto"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-gradient dark:bg-linear-gradient-dark bg-to-t from-background/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Sparkles className="h-4 w-4" />}
            title="Multi-model conversations"
            description="Switch models instantly per message or workflow."
          />
          <Feature
            icon={<Shield className="h-4 w-4" />}
            title="Self-hosted & private"
            description="Run locally. Own your data. No vendor lock-in."
          />
          <Feature
            icon={<History className="h-4 w-4" />}
            title="Unified history"
            description="One timeline across all models."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col md:flex-row justify-between gap-2 px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} OpenGPT</span>

          <a
            href="https://github.com/codexadarsh"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            codexadarsh
          </a>
        </div>
      </footer>
    </main>
  );
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="rounded-2xl border bg-secondary p-6">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
