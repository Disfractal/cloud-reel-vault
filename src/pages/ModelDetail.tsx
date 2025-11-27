import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getDocument, collections, updateDocument } from "@/lib/firestore-helpers";
import type { AutoModel } from "@/types/firestore";
import VideoUpload from "@/components/VideoUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ModelDetail = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const [model, setModel] = useState<AutoModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingUppercase, setUpdatingUppercase] = useState(false);
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

  const handleUppercaseToggle = async (checked: boolean) => {
    if (!modelId || !model) return;
    
    setUpdatingUppercase(true);
    try {
      await updateDocument<AutoModel>(collections.autoModels, modelId, {
        uppercase: checked
      });
      setModel({ ...model, uppercase: checked });
      toast({
        title: "Updated",
        description: `Model name will ${checked ? 'be displayed in uppercase' : 'use normal case'}.`
      });
    } catch (error) {
      console.error("Error updating uppercase setting:", error);
      toast({
        title: "Error",
        description: "Could not update uppercase setting.",
        variant: "destructive"
      });
    } finally {
      setUpdatingUppercase(false);
    }
  };

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
                <h1 className={`text-4xl font-bold mb-2 ${model.uppercase ? 'uppercase' : 'capitalize'}`}>
                  {model.name}
                </h1>
                <p className="text-xl text-muted-foreground capitalize">{model.makeName}</p>
                {(model.productionStartYear || model.productionEndYear) && (
                  <p className="text-lg text-muted-foreground mt-2">
                    Production: {model.productionStartYear || '?'} - {model.productionEndYear || 'Present'}
                  </p>
                )}
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-4">
                  {(model as any).encodingState && (model as any).encodingState !== 'complete' ? (
                    <Label className="text-muted-foreground">Video Processing</Label>
                  ) : (
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
                  <div className="flex items-center gap-2">
                    <Switch
                      id="uppercase-toggle"
                      checked={model.uppercase || false}
                      onCheckedChange={handleUppercaseToggle}
                      disabled={updatingUppercase}
                    />
                    <Label htmlFor="uppercase-toggle" className="cursor-pointer">
                      Uppercase
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetail;
