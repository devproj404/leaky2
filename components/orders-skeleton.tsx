export function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-800 rounded-md animate-pulse"></div>
              <div>
                <div className="h-5 w-40 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-6 w-24 bg-gray-800 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
