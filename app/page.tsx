import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-background">
        <div className="text-xl font-semibold tracking-tight">OpenGPT</div>

        <nav className="flex items-center gap-4">
          <Button asChild>
            <Link href="/chat">Start Chat</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-secondary border-b border-border">
        <div className="py-28 max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-medium tracking-tight">
            Free, open-source <br />
            Access to all models.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            OpenGPT is a unified chat interface for Grok, GPT 5, Claude, Gemini,
            and open-source models. Pick the model you want and chat — no
            switching tools, no vendor lock-in.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/chat">Start Chat</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com/codexadarsh/opengpt">
                Source Code
              </Link>
            </Button>
          </div>

          {/* Product Preview */}
          <div className="mt-20">
            <div className="rounded-xl bg-background p-2 shadow-sm max-w-5xl mx-auto">
              <Image
                src="/opengpt.png"
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

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-border text-sm text-muted-foreground flex justify-between">
        <span>© {new Date().getFullYear()} OpenGPT</span>
        <span>design & developed by codexadarsh</span>
      </footer>
    </main>
  );
}

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

function ModelCard({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="font-medium">{name}</div>
      <div className="text-sm text-muted-foreground">{detail}</div>
    </div>
  );
}
