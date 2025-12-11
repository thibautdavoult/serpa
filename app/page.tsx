import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, PieChart } from "lucide-react";

const tools = [
  {
    id: "topic-analyzer",
    title: "Website Topic Analyzer",
    tagline: "See what Google sees.",
    description:
      "Discover how your pages cluster into topics. Find the outliers that confuse search engines and dilute your authority.",
    href: "/app",
    icon: Layers,
    cta: "Analyze Your Topics",
  },
  {
    id: "blog-ratio",
    title: "Blog vs Website Ratio",
    tagline: "Is your blog carrying your SEO?",
    description:
      "Instantly see how much of your site is blog content vs core pages. Spot content imbalances before they cost you.",
    href: "/blog-ratio",
    icon: PieChart,
    cta: "Check Your Ratio",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg">Serpa</div>
          <nav className="flex items-center gap-6">
            <Link
              href="#tools"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Tools
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              SEO tools that show you what matters
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              No fluff. No 47-step setup. Just instant insights you can act on.
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="border-t bg-muted/30">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="group block p-6 bg-background border rounded-xl hover:border-foreground/20 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-foreground/5 transition-colors">
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {tool.title}
                        </h3>
                        <p className="text-sm font-medium text-foreground/80 mb-2">
                          {tool.tagline}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {tool.description}
                        </p>
                        <span className="inline-flex items-center text-sm font-medium group-hover:gap-2 transition-all">
                          {tool.cta}
                          <ArrowRight className="ml-1 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-2xl font-semibold mb-1">&lt; 2 min</p>
                  <p className="text-sm text-muted-foreground">
                    From URL to insights
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold mb-1">Free to start</p>
                  <p className="text-sm text-muted-foreground">
                    No credit card required
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold mb-1">Zero setup</p>
                  <p className="text-sm text-muted-foreground">
                    Just enter a domain
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-3">
                Stop guessing. Start seeing.
              </h2>
              <p className="text-muted-foreground mb-6">
                Pick a tool and get answers in under 2 minutes.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/app">
                  <Button size="lg">Try Topic Analyzer</Button>
                </Link>
                <Link href="/blog-ratio">
                  <Button size="lg" variant="outline">
                    Try Blog Ratio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2025 Serpa</p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
