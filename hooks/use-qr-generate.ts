"use client"

import { useMemo } from "react"

export function useQRGenerate(data: string) {
  return useMemo(() => {
    // Memoized QR data to prevent unnecessary re-renders
    return data
  }, [data])
}
