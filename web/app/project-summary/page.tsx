import { redirect } from "next/navigation";

export default function ProjectSummaryRedirect() {
  redirect("/about#summary");
}
