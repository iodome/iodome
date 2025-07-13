import { createCourse } from "@/actions/courses";

export default function CourseNewPage() {
  return (
    <div>
      <h1>New course</h1>
      <form action={createCourse}>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" />
        <label htmlFor="description">Description</label>
        <input type="text" name="description" id="description" />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
