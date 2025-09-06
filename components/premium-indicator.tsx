import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PremiumIndicatorProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function PremiumIndicator({ className, size = "md" }: PremiumIndicatorProps) {
  const sizeClasses = {
    sm: "text-xs py-0",
    md: "text-sm",
    lg: "text-base py-1 px-3",
  }

  return (
    <Badge variant="destructive" className={cn("flex items-center gap-1 font-medium", sizeClasses[size], className)}>
      <Lock className={cn("w-3 h-3", size === "lg" && "w-4 h-4")} />
      Premium
    </Badge>
  )
}
