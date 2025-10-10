"use client";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useLoading } from "@/hooks/use-loading";

export function GlobalLoadingOverlay() {
  const { isLoading } = useLoading();
  return <LoadingOverlay show={isLoading} />;
}