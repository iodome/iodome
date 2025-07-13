import { getCourse } from "@/actions/courses";

export default async function CoursePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const course = await getCourse(parseInt(params.id));

  return (
    <>
      <h1>{course.name}</h1>
      <p>{course.description}</p>
    </>
  );
}
