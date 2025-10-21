import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Tag as TagIcon } from "lucide-react";
import { mineralsService } from "@/services/database";
import type { Mineral } from "@/types/database";
import { toast } from "sonner";
import { format } from "date-fns";

const MineralPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mineral, setMineral] = useState<Mineral | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMineral();
    }
  }, [id]);

  const loadMineral = async () => {
    try {
      const data = await mineralsService.getById(id!);
      setMineral(data);
    } catch (error) {
      console.error('Error loading mineral:', error);
      toast.error('Failed to load mineral');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 loading-pulse rounded"></div>
          <div className="h-4 w-72 loading-pulse rounded"></div>
        </div>
        <div className="h-96 loading-pulse rounded-xl"></div>
      </div>
    );
  }

  if (!mineral) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">Mineral not found</div>
            <Button onClick={() => navigate('/minerals')} className="mt-4">
              Back to Minerals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {mineral.title}
            </h1>
            <Badge
              variant={
                mineral.status === 'published'
                  ? 'default'
                  : mineral.status === 'draft'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {mineral.status}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Preview of mineral entry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/minerals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Minerals
          </Button>
          <Button onClick={() => navigate(`/minerals/${mineral.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {mineral.images && mineral.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {mineral.images.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <img
                        src={image.url}
                        alt={image.alt || mineral.title}
                        className="w-full h-48 object-cover rounded-lg border border-border"
                      />
                      {image.caption && (
                        <p className="text-sm text-muted-foreground">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {mineral.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: mineral.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Video */}
          {mineral.video_url && (
            <Card>
              <CardHeader>
                <CardTitle>Video</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={mineral.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {mineral.video_url}
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <div className="text-sm font-medium">
                  {format(new Date(mineral.created_at), 'PPP')}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Last Updated
                </div>
                <div className="text-sm font-medium">
                  {format(new Date(mineral.updated_at), 'PPP')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Slug</div>
                <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {mineral.slug}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          {mineral.category && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">
                  {mineral.category}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* SEO */}
          {(mineral.meta_title || mineral.meta_description) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mineral.meta_title && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Meta Title</div>
                    <div className="text-sm">{mineral.meta_title}</div>
                  </div>
                )}
                {mineral.meta_description && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Meta Description</div>
                    <div className="text-sm">{mineral.meta_description}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MineralPreview;
