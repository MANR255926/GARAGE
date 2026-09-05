import { ErrorScene } from "@/components/shared/ErrorScene";

interface ErrorCopy {
  title: string;
  message: string;
}

const ERROR_COPY_MAP: Record<string, ErrorCopy> = {
  "400": {
    title: "Bad Request",
    message: "The workshop diagnostic tool received malformed or invalid parameters.",
  },
  "401": {
    title: "Locked bay",
    message: "You need to sign in to access this.",
  },
  "403": {
    title: "Off-limits",
    message: "You don't have permission to be in this bay.",
  },
  "404": {
    title: "This bay is empty",
    message: "We couldn't find the part you're looking for — it may have been moved or never installed.",
  },
  "500": {
    title: "Engine trouble",
    message: "An unexpected mechanical failure occurred while processing this request. Our diagnostic tools are on it.",
  },
  "503": {
    title: "Workshop Maintenance",
    message: "Our service bays are temporarily undergoing routine maintenance. Please check back shortly.",
  },
};

const DEFAULT_ERROR_COPY: ErrorCopy = {
  title: "Diagnostic Alert",
  message: "An unexpected status code was encountered in our workshop systems.",
};

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const { code: rawCode, message: customMessage } = await searchParams;
  const raw = rawCode || "500";
  const code = /^\d{3}$/.test(raw) ? raw : "500";
  const defaults = ERROR_COPY_MAP[code] || DEFAULT_ERROR_COPY;

  const title = defaults.title;
  const message = customMessage || defaults.message;

  return (
    <ErrorScene
      code={code}
      title={title}
      message={message}
      primaryAction={{
        label: "Back to Home",
        href: "/",
      }}
      secondaryAction={{
        label: "Go Back",
      }}
    />
  );
}