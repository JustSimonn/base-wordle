import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Base Wordle</h3>
            <p className="text-sm text-muted-foreground">
              Play Wordle on the Base blockchain — simple, fun, and on-chain.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/game" className="text-muted-foreground hover:text-primary transition-colors">
                  Play Game
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://x.com/_PulseIX"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  x / @_PulseIX
                </a>
              </li>
              <li>
                <a
                  href="mailto:chimeberesimon23@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground text-center">
          <p>&copy; {new Date().getFullYear()} Base Wordle. Built for fun on Base.</p>
          <p className="mt-2 md:mt-0">
            Built with ❤️ by{" "}
            <a href="https://x.com/_PulseIX" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              justsimon
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}