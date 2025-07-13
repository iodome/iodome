import Link from "next/link";

export default function CoursesPage() {
  return (
    <>
      <h1>Courses</h1>
      <Link href="/courses/new">New Course</Link>
    </>
  );
}
