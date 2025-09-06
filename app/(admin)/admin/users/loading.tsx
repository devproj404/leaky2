export default function AdminUsersLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="mr-4 p-2 rounded-full bg-gray-800 w-9 h-9"></div>
          <div className="h-8 bg-gray-800 rounded w-48"></div>
        </div>
        <div className="h-6 bg-gray-800 rounded w-20"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="relative mb-6">
        <div className="w-full h-10 bg-gray-800 rounded-lg"></div>
      </div>

      {/* Table skeleton */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                {[...Array(5)].map((_, i) => (
                  <th key={i} scope="col" className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700"></div>
                      <div className="ml-4">
                        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-5 bg-gray-700 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-700 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-7 w-7 bg-gray-700 rounded-full"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
