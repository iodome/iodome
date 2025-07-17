import { db } from "@/db";
import { coursesTable } from "./schema";

async function main() {
  for (let index = 0; index < 5; index++) {
    console.log(`Creating course ${index}...`);
    const course = await db.insert(coursesTable).values({
      name: `Course ${index}`,
      description: `Description ${index}`,
    });
    console.log({ course });
  }
}

main();
