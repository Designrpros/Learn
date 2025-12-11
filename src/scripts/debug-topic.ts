import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    // Check Child
    const slug = 'user-experience-ux-design';
    const topic = await db.query.topics.findFirst({
        where: eq(topics.slug, slug),
        with: {
            parent: true
        }
    });
    console.log("--- CHILD ---");
    console.log("Title:", topic?.title);
    console.log("Slug:", topic?.slug);
    console.log("Parent:", topic?.parent?.title || "None (NULL)");
    console.log("Parent Overview:", topic?.parent?.overview);

    // Check Potential Parent (Design)
    const parentSlug = 'design';
    const parent = await db.query.topics.findFirst({
        where: eq(topics.slug, parentSlug)
    });
    console.log("\n--- EXPECTED PARENT ---");
    console.log("Title:", parent?.title);
    console.log("ID:", parent?.id);
    console.log("Overview:", parent?.overview);

    process.exit(0);
}

check();
