import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { createCourse, getCourses } from "@/actions/courses";

describe("actions", () => {
  describe("createCourse", () => {
    it("should create an course and redirect to the course page", async () => {
      vi.mock("next/navigation", () => ({
        redirect: vi.fn(),
        notFound: vi.fn(),
      }));
      vi.mock("next/cache", () => ({
        revalidatePath: vi.fn(),
      }));
      const formData = new FormData();
      formData.append("name", "test name");
      formData.append("description", "test description");

      await createCourse(formData);
      const courses = await getCourses();

      expect(courses.length).toBe(1);
      expect(revalidatePath).toHaveBeenCalledWith("/courses");
      expect(redirect).toHaveBeenCalledWith(`/courses/${courses[0].id}`);
    });
  });
});
