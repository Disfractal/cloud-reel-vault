import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getDocument, collections } from "@/lib/firestore-helpers";
import type { AutoModel } from "@/types/firestore";
import VideoUpload from "@/components/VideoUpload";
import { useAuth } from "@/contexts/AuthContext";

const ModelDetail = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const [model, setModel] = useState<AutoModel | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchModel = async () => {
      if (!modelId) return;
      
      try {
        const modelData = await getDocument<AutoModel>(collections.autoModels, modelId);
        if (modelData) {
          setModel(modelData);
        } else {
          toast({
            title: "Not found",
            description: "Car model not found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching model:", error);
        toast({
          title: "Error",
          description: "Could not load car model details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [modelId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Makes
            </Button>
          </Link>
          <p className="text-lg text-muted-foreground">Model not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 md:px-6">
        <Link to={`/make/${model.makeId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {model.makeName}
          </Button>
        </Link>

        <div className="max-w-6xl">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold capitalize mb-2">{model.name}</h1>
                <p className="text-xl text-muted-foreground capitalize">{model.makeName}</p>
                {(model.productionStartYear || model.productionEndYear) && (
                  <p className="text-lg text-muted-foreground mt-2">
                    Production: {model.productionStartYear || '?'} - {model.productionEndYear || 'Present'}
                  </p>
                )}
              </div>
              {isAdmin && (
                <VideoUpload
                  modelId={model.id}
                  modelName={model.name}
                  currentVideoUrl={(model as any).videoUrl}
                  onUploadComplete={() => {
                    if (modelId) {
                      getDocument<AutoModel>(collections.autoModels, modelId).then(updated => {
                        if (updated) setModel(updated);
                      });
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetail;
