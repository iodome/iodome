"use server";

import prisma from "@/prisma/db";
import { Course } from "@/app/generated/prisma";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

export async function getCourse(id: number): Promise<Course> {
  const course = await prisma.course.findUnique({
    where: { id },
  });
  if (!course) notFound();
  return course;
}

export async function getCourses(): Promise<Course[]> {
  return await prisma.course.findMany();
}

export async function createCourse(formData: FormData): Promise<void> {
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const course = await prisma.course.create({ data });

  revalidatePath("/courses");
  redirect(`/courses/${course.id}`);
}
