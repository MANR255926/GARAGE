"use client";

import { useEffect } from "react";
import { ErrorScene } from "@/components/shared/ErrorScene";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught by error.tsx boundary:", error);
  }, [error]);

  return (
    <ErrorScene
      code="500"
      title="Engine Trouble"
      message={
        error?.message &&
        error.message !==
          "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details."
          ? error.message
          : "An unexpected mechanical failure occurred while processing this request. Our diagnostic tools are on it."
      }
      primaryAction={{
        label: "Back to Home",
        href: "/",
      }}
      secondaryAction={{
        label: "Try Again",
        onClick: reset,
      }}
    />
  );
}