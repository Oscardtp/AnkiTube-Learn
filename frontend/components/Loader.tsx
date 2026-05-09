"use client"

import { FC } from "react"
import { Loader2 } from "lucide-react"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
}

export const Loader: FC<LoaderProps> = ({ size = "md", className = "" }) => {
  return (
    <Loader2 className={`${sizeMap[size]} text-primary animate-spin ${className}`} />
  )
}
