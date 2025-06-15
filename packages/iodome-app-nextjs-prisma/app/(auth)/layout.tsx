import { signOut } from "@/actions/authentication";
import Link from "next/link";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex justify-between items-center gap-4 p-8 bg-white border-b">
        <Link href="/">iodome-app-nextjs-prisma</Link>
        <nav>
          <ul className="flex gap-4">
            <>
              <li>
                <Link href="/articles">Articles</Link>
              </li>
              <li>
                <form action={signOut}>
                  <button type="submit" className="text-blue-950">
                    Sign out
                  </button>
                </form>
              </li>
            </>
          </ul>
        </nav>
      </header>
      <div className="p-8">{children}</div>
    </>
  );
}
