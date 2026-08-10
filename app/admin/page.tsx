import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/admin-app";

export const metadata: Metadata = {
  title: "Studio",
  // Not secret — the page is public and holds nothing until a vault is set up
  // on the device — but there is no reason for it to be in search results.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="relative pt-28 pb-20 md:pt-32">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div className="container-page max-w-3xl">
        <AdminApp />
      </div>
    </section>
  );
}
