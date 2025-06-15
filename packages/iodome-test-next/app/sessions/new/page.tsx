import { signIn } from "@/actions/authentication";
import Link from "next/link";

export default async function SessionsNewPage() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-xl text-blue-600">Welcome</h1>
      <form action={signIn} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            className="border block w-full rounded p-2"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="border block w-full rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded py-2"
        >
          Sign in
        </button>
      </form>
      <Link
        href="/users/new"
        className="text-blue-600 hover:text-blue-700 underline"
      >
        Register
      </Link>
    </div>
  );
}
