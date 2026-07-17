import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Nav from "@/components/Nav";
import ProductForm from "@/components/ProductForm";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Nav email={session.email} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display mb-6 text-2xl font-700 text-ink">Add product</h1>
        <ProductForm />
      </main>
    </>
  );
}
