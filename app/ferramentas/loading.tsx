import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900" />
      <div className="flex flex-1">
        <div className="hidden md:block w-64 border-r" />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded animate-shimmer" />
                <div className="h-4 w-64 bg-muted rounded animate-shimmer" />
              </div>
              <div className="h-12 w-40 bg-muted rounded-xl animate-shimmer" />
            </div>

            <Card className="shadow-md rounded-xl">
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded animate-shimmer" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded animate-shimmer" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded animate-shimmer" />
                        <div className="h-3 w-24 bg-muted rounded animate-shimmer" />
                      </div>
                      <div className="h-8 w-20 bg-muted rounded animate-shimmer" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
