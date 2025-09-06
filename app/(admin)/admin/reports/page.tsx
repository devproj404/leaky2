import { createClient } from "@/lib/supabase-server"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ReportActionButtons } from "@/components/admin/report-action-buttons"

interface Report {
  id: number
  content_id: number
  content_title: string
  status: string
  upvotes: number
  created_at: string
}

export default async function ReportedLinksPage() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from("link_reports")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-pink-500">Reported Links</h1>
          <p className="text-gray-400 text-sm">Manage reported dead links</p>
        </div>
      </div>

      <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Content</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Upvotes</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Reported</th>
                <th className="text-right py-3 px-4 font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports && reports.length > 0 ? (
                reports.map((report: Report) => (
                  <tr key={report.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{report.content_title}</div>
                      <div className="text-sm text-gray-400">ID: {report.content_id}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          report.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : report.status === "resolved"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">{report.upvotes}</td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ReportActionButtons reportId={report.id} currentStatus={report.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No reported links found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
