import { redirect } from "next/navigation";

export default function ResultsRedirect({
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
  params.set("step", "5");
  const q = params.toString();
  redirect("/" + (q ? `?${q}` : ""));
}
