import { db } from "@/db";
import { coursesTable } from "@/db/schema";

export default async function Home() {
  const courses = await db.select().from(coursesTable);

  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {courses.length > 0 &&
          courses.map((course) => (
            <li key={course.id}>
              {course.name} - {course.description}
            </li>
          ))}
      </ul>
    </div>
  );
}
