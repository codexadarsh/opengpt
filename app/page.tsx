import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen mx-auto bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border">
        <div className="text-xl font-semibold tracking-tight">OpenGPT</div>

        <nav className="flex items-center gap-5">
          <Link
            href="/docs"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Docs
          </Link>
          <Link
            href="https://github.com/codexadarsh/opengpt"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            GitHub
          </Link>
          <Button asChild>
            <Link href="/chat">Start Chat</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="py-28 max-w-6xl mx-auto text-center px-6">
          <h1 className="text-6xl md:text-7xl font-medium tracking-tight">
            One chat UI. <br />
            All major AI models.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            OpenGPT is an open-source, unified chat interface for GPT-5, Claude,
            Gemini, Grok, and open-source models. Switch models instantly —
            without switching tools or workflows.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/chat">Start chatting</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">How it works</Link>
            </Button>
          </div>

          {/* Product Preview */}
          <div className="mt-20">
            <div className="rounded-xl border border-border p-2 shadow-sm max-w-5xl mx-auto">
              <Image
                src="/hero.png"
                alt="OpenGPT unified chat interface"
                width={1200}
                height={700}
                className="rounded-lg w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            title="Multi-model conversations"
            description="Switch between GPT-5, Claude, Gemini, Grok, and open models inside the same interface."
          />
          <Feature
            title="Open-source & self-hosted"
            description="No vendor lock-in. Run OpenGPT locally or deploy it on your own infrastructure."
          />
          <Feature
            title="Unified chat history"
            description="One conversation history across all models — no fragmented tools or tabs."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-border text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} OpenGPT · MIT License</span>
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
      </footer>
    </main>
  );
}

/* ---------------- Components ---------------- */

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary p-6">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
