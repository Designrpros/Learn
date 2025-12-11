import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    topic: string;
  }>;
}

export default async function LearnPage({ params }: PageProps) {
  const { topic } = await params;
  // Redirect any legacy /learn/ links to /wiki/
  redirect(`/wiki/${topic}`);
}