import { HomeClient } from '@/components/home-client';
import { getUserDashboardStats } from '@/lib/db-queries';
import { auth } from '@clerk/nextjs/server';

export const revalidate = 0; // Fresh data

export default async function Home() {
  const { userId } = await auth();
  const stats = userId ? await getUserDashboardStats(userId) : null;

  return (
    <HomeClient initialStats={stats} />
  );
}