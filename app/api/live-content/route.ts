import { z } from "zod";
import { getLiveContentSections } from "@/lib/live-content";

const topicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  query: z.string(),
});

const requestSchema = z.object({
  page: z.enum(["neighborhoods", "conscious-move", "resources"]),
  citySlug: z.string().min(1),
  topics: z.array(topicSchema).min(1),
  limit: z.number().int().min(1).max(6).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json({ error: "Invalid live content request" }, { status: 400 });
    }

    const sections = await getLiveContentSections(parsed.data);
    return Response.json({ sections });
  } catch (error) {
    console.error("Failed to fetch live content", error);
    return Response.json({ error: "Failed to fetch live content" }, { status: 500 });
  }
}
