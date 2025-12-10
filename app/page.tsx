import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg">Serpa</div>
          <nav className="flex items-center gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/app">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              Capture More Visibility with People Also Ask
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Find exactly which PAA questions you&apos;re missing.
              Simple gap analysis for SEOs who want results, not complexity.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/app">
                <Button size="lg" className="h-12 px-8">
                  Start Free Analysis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div>
                <h3 className="font-semibold text-lg mb-3">One Input, One Output</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enter your keywords and domain. Get instant visibility into which PAA questions you&apos;re missing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Visual Gap Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Color-coded dashboard shows exactly where you have opportunities to capture more visibility.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Fast ROI</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Identify content opportunities in under 2 minutes. No learning curve, no complexity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Ready to discover your opportunities?
              </h2>
              <p className="text-muted-foreground mb-8">
                Start with 2 free queries. No credit card required.
              </p>
              <Link href="/app">
                <Button size="lg" className="h-12 px-8">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2025 Serpa. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
