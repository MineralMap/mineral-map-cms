import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database, TrendingUp, FolderOpen } from "lucide-react";
import { mineralsService, categoriesService } from "@/services/database";
import type { Mineral } from "@/types/database";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [minerals, setMinerals] = useState<Mineral[]>([]);
  const [tagCount, setTagCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [mineralsData, tagsData] = await Promise.all([
        mineralsService.getAll(),
        categoriesService.getAll()
      ]);
      setMinerals(mineralsData);
      setTagCount(tagsData.length);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const publishedCount = minerals.filter(m => m.status === 'published').length;
  const publishedPercentage = minerals.length > 0
    ? Math.round((publishedCount / minerals.length) * 100)
    : 0;

  const stats = [
    {
      title: "Total Minerals",
      value: isLoading ? "..." : minerals.length.toString(),
      description: `${publishedCount} published`,
      icon: Database,
      trend: "up",
    },
    {
      title: "Categories",
      value: isLoading ? "..." : tagCount.toString(),
      description: "Active tags",
      icon: BarChart3,
      trend: "up",
    },
    {
      title: "Published Items",
      value: isLoading ? "..." : publishedCount.toString(),
      description: `${publishedPercentage}% of total minerals`,
      icon: TrendingUp,
      trend: "stable",
    },
    {
      title: "Draft Items",
      value: isLoading ? "..." : minerals.filter(m => m.status === 'draft').length.toString(),
      description: "Unpublished minerals",
      icon: FolderOpen,
      trend: "up",
    },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your content management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Minerals</CardTitle>
            <CardDescription>Latest mineral entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : minerals.slice(0, 5).length > 0 ? (
                minerals.slice(0, 5).map((mineral) => (
                  <div key={mineral.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <span className="text-sm font-medium">{mineral.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({mineral.status})
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(mineral.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No minerals yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/minerals/new')}
                className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <div className="font-medium text-sm">Add New Mineral</div>
                <div className="text-xs text-muted-foreground">Create a new mineral entry</div>
              </button>
              <button
                onClick={() => navigate('/categories/new')}
                className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <div className="font-medium text-sm">Create Category</div>
                <div className="text-xs text-muted-foreground">Organize your content</div>
              </button>
              <button
                onClick={() => navigate('/minerals')}
                className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <div className="font-medium text-sm">View All Minerals</div>
                <div className="text-xs text-muted-foreground">Browse your collection</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;