export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {children}
    </div>
  )
}
