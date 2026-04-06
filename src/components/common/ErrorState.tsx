'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
  title?: string
}

export function ErrorState({ message, onRetry, title = 'Terjadi Kesalahan' }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Card className="border-destructive/30 max-w-md w-full">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
