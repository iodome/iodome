"use server";

import { db } from "@/db";
import { coursesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

export async function getCourse(id: number) {
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, id))
    .limit(1);
  if (!course) notFound();
  return course;
}

export async function getCourses() {
  return await db.select().from(coursesTable);
}

export async function createCourse(formData: FormData): Promise<void> {
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const [course] = await db
    .insert(coursesTable)
    .values({ ...data })
    .returning();

  revalidatePath("/courses");
  redirect(`/courses/${course.id}`);
}
