import { ErrorScene } from "@/components/shared/ErrorScene";

export const metadata = {
  title: "404 - Bay Not Found | Allyan Garage",
  description: "The requested workshop page or service bay does not exist.",
};

export default function NotFound() {
  return (
    <ErrorScene
      code="404"
      title="This bay is empty"
      message="We couldn't find the part or page you're looking for — it may have been moved, decommissioned, or never installed in our workshop."
      primaryAction={{
        label: "Back to Home",
        href: "/",
      }}
    />
  );
}