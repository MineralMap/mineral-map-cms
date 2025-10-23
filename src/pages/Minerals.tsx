import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye, Star } from "lucide-react";
import { mineralsService } from "@/services/database";
import type { Mineral } from "@/types/database";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

// Build the status badge colors using existing classes in this page
type DisplayStatus = "Published" | "Draft" | "Archived";

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
  const [minerals, setMinerals] = useState<Mineral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await mineralsService.getAll();
        setMinerals(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load minerals");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredMinerals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return minerals
      .filter((m) =>
        (
          m.title + " " + (m.description || "") + " " + m.slug + " " + (m.category || "")
        )
          .toLowerCase()
          .includes(q)
      )
      .map((m) => ({
        id: m.id,
        name: m.title,
        category: m.category || "—",
        color: "—", // Not in base schema; placeholder to preserve layout
        hardness: "—", // Not in base schema; placeholder to preserve layout
        status: (m.status.charAt(0).toUpperCase() + m.status.slice(1)) as DisplayStatus,
        lastModified: format(new Date(m.updated_at), "yyyy-MM-dd"),
        featured: m.featured || false,
      }));
  }, [minerals, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mineral?")) return;
    try {
      await mineralsService.delete(id);
      setMinerals((prev) => prev.filter((m) => m.id !== id));
      toast.success("Mineral deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete mineral");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const updatedMineral = await mineralsService.toggleFeatured(id, !currentFeatured);
      setMinerals((prev) =>
        prev.map((m) => (m.id === id ? updatedMineral : m))
      );
      toast.success(
        updatedMineral.featured
          ? "Mineral featured successfully"
          : "Mineral unfeatured successfully"
      );
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Failed to update featured status";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minerals</h1>
          <p className="text-muted-foreground mt-2">
            Manage your mineral collection and data
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Click the star to feature minerals (max 3, published only)</span>
          </div>
        </div>
        <Button onClick={() => navigate("/minerals/new")} className="bg-primary hover:bg-primary-hover text-primary-foreground">
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
      {isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">Loading minerals...</div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMinerals.map((mineral) => (
          <Card key={mineral.id} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2 flex-1">
                  <button
                    onClick={() => handleToggleFeatured(mineral.id, mineral.featured)}
                    className="mt-1 transition-all duration-200 hover:scale-110"
                    title={
                      mineral.status !== 'Published'
                        ? "Only published minerals can be featured"
                        : mineral.featured
                        ? "Unfeature mineral"
                        : "Feature mineral"
                    }
                    disabled={mineral.status !== 'Published'}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        mineral.featured
                          ? "fill-yellow-400 text-yellow-400"
                          : mineral.status !== 'Published'
                          ? "text-gray-200 cursor-not-allowed"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                  <div>
                    <CardTitle className="text-lg">{mineral.name}</CardTitle>
                    <CardDescription>{mineral.category}</CardDescription>
                  </div>
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
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2" onClick={() => navigate(`/minerals/${mineral.id}/preview`)}>
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline ml-1">View</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs px-2" onClick={() => navigate(`/minerals/${mineral.id}/edit`)}>
                    <Edit className="h-3 w-3" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(mineral.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && filteredMinerals.length === 0 && (
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