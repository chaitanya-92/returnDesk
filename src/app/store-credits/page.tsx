import { redirect } from "next/navigation";

export default function StoreCreditsPage() {
  redirect("/requests?view=store-credits");
}
