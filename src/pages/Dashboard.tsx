import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Database, TrendingUp } from "lucide-react";
import { SupabaseConnectionTest } from "@/components/SupabaseConnectionTest";

const stats = [
  {
    title: "Total Minerals",
    value: "156",
    description: "+12% from last month",
    icon: Database,
    trend: "up",
  },
  {
    title: "Categories",
    value: "24",
    description: "+3 new categories",
    icon: BarChart3,
    trend: "up",
  },
  {
    title: "Published Items",
    value: "142",
    description: "91% of total minerals",
    icon: TrendingUp,
    trend: "stable",
  },
  {
    title: "Contributors",
    value: "8",
    description: "Active this month",
    icon: Users,
    trend: "up",
  },
];

const recentActivity = [
  { action: "Added", item: "Quartz Crystal", time: "2 hours ago" },
  { action: "Updated", item: "Amethyst Category", time: "4 hours ago" },
  { action: "Published", item: "Rose Quartz", time: "6 hours ago" },
  { action: "Created", item: "Precious Stones Category", time: "1 day ago" },
];

const Dashboard = () => {
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

      {/* Supabase Connection Test */}
      <div className="flex justify-center">
        <SupabaseConnectionTest />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest changes in your CMS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium">{activity.action}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {activity.item}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
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
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                <div className="font-medium text-sm">Add New Mineral</div>
                <div className="text-xs text-muted-foreground">Create a new mineral entry</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                <div className="font-medium text-sm">Create Category</div>
                <div className="text-xs text-muted-foreground">Organize your content</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                <div className="font-medium text-sm">Bulk Import</div>
                <div className="text-xs text-muted-foreground">Import multiple items</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;