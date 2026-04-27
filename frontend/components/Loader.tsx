"use client"

import { FC } from "react"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  color?: "primary" | "on-surface" | "custom"
  className?: string
}

export const Loader: FC<LoaderProps> = ({ color = "on-surface", className = "" }) => {
  const colorClass = color === "custom" ? "" : `loader-${color}`

  return <div className={`loader loader-md ${colorClass} ${className}`} />
}
