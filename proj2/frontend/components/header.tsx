export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-xl font-bold text-foreground">Vibe Eats</h1>
        </div>

        {/* Minimal right side - can add user menu later */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">U</span>
        </div>
      </div>
    </header>
  )
}
