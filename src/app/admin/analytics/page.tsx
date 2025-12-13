
import { getAnalyticsData } from "@/lib/analytics";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";

export default async function AdminAnalyticsPage() {
    const { growthData, topicData } = await getAnalyticsData();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Analytics</h2>
                <p className="text-neutral-400">Deep dive into platform performance and user behavior.</p>
            </div>

            <AnalyticsDashboard growthData={growthData} topicData={topicData} />
        </div>
    );
}
