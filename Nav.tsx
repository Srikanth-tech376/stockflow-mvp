import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Nav from "@/components/Nav";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const org = await prisma.organization.findUnique({ where: { id: session.organizationId } });

  return (
    <>
      <Nav email={session.email} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display mb-6 text-2xl font-700 text-ink">Settings</h1>
        <SettingsForm initialThreshold={org?.defaultLowStockThreshold ?? 5} />
      </main>
    </>
  );
}
