import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border">
        <div className="text-xl font-semibold tracking-tight">OpenGPT</div>

        <nav className="flex items-center gap-4">
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
          <Button size="sm" asChild>
            <Link href={"https://openrouter.ai/settings/keys"}>
              Get API Key
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <p className="mt-4 text-6xl font-medium tracking-tight">
          Free. Open-source. All models.
        </p>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          opengpt is a unified, open-source AI API that lets you use and switch
          between models without lock-in.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href={"/chat"}>Start Chat</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={"/docs"}>View Docs</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-10 max-w-6xl mx-auto grid gap-10 md:grid-cols-3">
        <Feature
          title="Unified API"
          description="Same request format across models. Switching providers never breaks your code."
        />
        <Feature
          title="Open Source"
          description="MIT licensed core. Audit it, self-host it, or extend it."
        />
        <Feature
          title="Free Models"
          description="Use open and local models at zero cost. No credit card required."
        />
      </section>

      {/* Supported Models */}
      <section className="px-6 py-20 bg-secondary border-y border-border mt-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-medium">Supported Models</h2>

          <p className="text-sm text-muted-foreground mt-2">
            Choose what fits. Change anytime.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "OpenAI",
              "Claude",
              "Gemini",
              "LLaMA",
              "Mistral",
              "Local Models",
            ].map((model) => (
              <Button key={model}>{model}</Button>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold">Built in the open</h2>

        <p className="mt-4 text-muted-foreground">
          opengpt is community-driven and transparent. No lock-in. No hidden
          layers.
        </p>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="https://github.com/codexadarsh/opengpt" target="_blank">
              View on GitHub
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-border text-muted-foreground flex justify-between">
        <span> &copy; {new Date().getFullYear()} opengpt</span>
        <span>developed & design by codexadarsh</span>
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
