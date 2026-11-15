import { redirect } from "next/navigation";

/**
 * Compatibility redirect: /play -> /
 * Preserves all mission parameters (step, scene, south, north, west, east, region, preset, pred, etc.)
 */
export default function PlayRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string") {
        params.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      }
    }
  }
  const q = params.toString();
  redirect("/" + (q ? `?${q}` : ""));
}
