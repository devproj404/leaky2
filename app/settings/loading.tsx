import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48 bg-gray-700 mb-6" />

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <Skeleton className="h-8 w-40 bg-gray-700 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </div>
          <div className="flex justify-end mt-4">
            <Skeleton className="h-10 w-32 bg-gray-700" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <Skeleton className="h-8 w-40 bg-gray-700 mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-36 bg-gray-700" />
                <Skeleton className="h-4 w-48 bg-gray-700" />
              </div>
              <Skeleton className="h-6 w-12 bg-gray-700 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <Skeleton className="h-6 w-24 bg-gray-700" />
                <Skeleton className="h-4 w-40 bg-gray-700" />
              </div>
              <Skeleton className="h-6 w-12 bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <Skeleton className="h-8 w-40 bg-gray-700 mb-4" />
          <Skeleton className="h-10 w-full bg-gray-700" />
        </div>
      </div>
    </div>
  )
}
