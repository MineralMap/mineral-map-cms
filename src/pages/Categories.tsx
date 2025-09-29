import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, FolderOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  color: string;
  createdDate: string;
}

const sampleCategories: Category[] = [
  {
    id: "1",
    name: "Quartz",
    description: "Silicon dioxide minerals including varieties like amethyst and citrine",
    itemCount: 24,
    color: "bg-purple-100 text-purple-800",
    createdDate: "2024-01-10",
  },
  {
    id: "2",
    name: "Precious Metals",
    description: "Rare and valuable metallic elements",
    itemCount: 8,
    color: "bg-yellow-100 text-yellow-800",
    createdDate: "2024-01-08",
  },
  {
    id: "3",
    name: "Carbonates",
    description: "Minerals containing carbonate ion groups",
    itemCount: 15,
    color: "bg-green-100 text-green-800",
    createdDate: "2024-01-05",
  },
  {
    id: "4",
    name: "Sulfides",
    description: "Minerals containing sulfur combined with metals",
    itemCount: 18,
    color: "bg-blue-100 text-blue-800",
    createdDate: "2024-01-03",
  },
  {
    id: "5",
    name: "Oxides",
    description: "Minerals containing oxygen combined with other elements",
    itemCount: 12,
    color: "bg-red-100 text-red-800",
    createdDate: "2024-01-01",
  },
  {
    id: "6",
    name: "Silicates",
    description: "Largest group of minerals containing silicon and oxygen",
    itemCount: 31,
    color: "bg-indigo-100 text-indigo-800",
    createdDate: "2023-12-28",
  },
];

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories] = useState<Category[]>(sampleCategories);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {category.itemCount} items
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  Created: {category.createdDate}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              No categories found matching your search criteria.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Category Overview</CardTitle>
          <CardDescription>Summary of your content organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Total Categories</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {categories.reduce((sum, cat) => sum + cat.itemCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(categories.reduce((sum, cat) => sum + cat.itemCount, 0) / categories.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg per Category</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.max(...categories.map(cat => cat.itemCount))}
              </div>
              <div className="text-sm text-muted-foreground">Largest Category</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;