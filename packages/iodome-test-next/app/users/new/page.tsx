import { register } from "@/actions/authentication";

export default async function NewUserPage() {
  return (
    <form action={register} className="flex flex-col gap-4">
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
        Sign up
      </button>
    </form>
  );
}
