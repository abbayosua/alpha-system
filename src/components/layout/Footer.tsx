export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/20 dark:bg-muted/10">
      <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>&copy; {new Date().getFullYear()} Alpha System v5</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground/60">v5.0.0</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-muted-foreground/60">Comprehensive Management System</span>
        </div>
      </div>
    </footer>
  )
}
