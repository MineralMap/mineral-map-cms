import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, FolderOpen } from "lucide-react";
import { tagsService, mineralsService } from "@/services/database";
import type { Tag } from "@/types/database";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tagUsageCounts, setTagUsageCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tagsData, mineralsData] = await Promise.all([
        tagsService.getAll(),
        mineralsService.getAll()
      ]);

      setTags(tagsData);

      // Calculate tag usage counts
      const counts: Record<string, number> = {};
      mineralsData.forEach(mineral => {
        mineral.tags.forEach(tagName => {
          counts[tagName] = (counts[tagName] || 0) + 1;
        });
      });
      setTagUsageCounts(counts);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" tag? This won't affect minerals using this tag.`)) return;
    try {
      await tagsService.delete(id);
      setTags(prev => prev.filter(t => t.id !== id));
      toast.success('Tag deleted');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  const filteredCategories = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tag.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your mineral categories
          </p>
        </div>
        <Button onClick={() => navigate('/categories/new')} className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">Loading categories...</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map((tag) => {
            const itemCount = tagUsageCounts[tag.name] || 0;
            return (
              <Card key={tag.id} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: tag.color + '20' }}
                      >
                        <FolderOpen className="h-6 w-6" style={{ color: tag.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tag.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tag.description || 'No description provided'}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Created: {format(new Date(tag.created_at), 'yyyy-MM-dd')}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/categories/${tag.id}/edit`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(tag.id, tag.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              No categories found matching your search criteria.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {!isLoading && tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Overview</CardTitle>
            <CardDescription>Summary of your content organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{tags.length}</div>
                <div className="text-sm text-muted-foreground">Total Categories</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {Object.values(tagUsageCounts).reduce((sum, count) => sum + count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {tags.length > 0
                    ? Math.round(Object.values(tagUsageCounts).reduce((sum, count) => sum + count, 0) / tags.length)
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg per Category</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {Object.values(tagUsageCounts).length > 0
                    ? Math.max(...Object.values(tagUsageCounts))
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Largest Category</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Categories;