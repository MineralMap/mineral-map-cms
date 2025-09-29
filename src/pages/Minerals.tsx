import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

interface Mineral {
  id: string;
  name: string;
  category: string;
  color: string;
  hardness: string;
  status: "Published" | "Draft" | "Archived";
  lastModified: string;
}

const sampleMinerals: Mineral[] = [
  {
    id: "1",
    name: "Amethyst",
    category: "Quartz",
    color: "Purple",
    hardness: "7",
    status: "Published",
    lastModified: "2024-01-15",
  },
  {
    id: "2",
    name: "Rose Quartz",
    category: "Quartz",
    color: "Pink",
    hardness: "7",
    status: "Published",
    lastModified: "2024-01-14",
  },
  {
    id: "3",
    name: "Pyrite",
    category: "Sulfide",
    color: "Gold",
    hardness: "6.5",
    status: "Draft",
    lastModified: "2024-01-13",
  },
  {
    id: "4",
    name: "Malachite",
    category: "Carbonate",
    color: "Green",
    hardness: "3.5-4",
    status: "Published",
    lastModified: "2024-01-12",
  },
  {
    id: "5",
    name: "Hematite",
    category: "Oxide",
    color: "Metallic Gray",
    hardness: "5-6",
    status: "Archived",
    lastModified: "2024-01-10",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Published":
      return "bg-success text-success-foreground";
    case "Draft":
      return "bg-warning text-warning-foreground";
    case "Archived":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Minerals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [minerals] = useState<Mineral[]>(sampleMinerals);

  const filteredMinerals = minerals.filter((mineral) =>
    mineral.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mineral.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minerals</h1>
          <p className="text-muted-foreground mt-2">
            Manage your mineral collection and data
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Mineral
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search minerals by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Minerals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMinerals.map((mineral) => (
          <Card key={mineral.id} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{mineral.name}</CardTitle>
                  <CardDescription>{mineral.category}</CardDescription>
                </div>
                <Badge className={getStatusColor(mineral.status)}>
                  {mineral.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <div className="font-medium">{mineral.color}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hardness:</span>
                    <div className="font-medium">{mineral.hardness}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last modified: {mineral.lastModified}
                </div>
                <div className="flex gap-1 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2">
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline ml-1">View</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2">
                    <Edit className="h-3 w-3" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMinerals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              No minerals found matching your search criteria.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Minerals;