import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getDocument, queryDocuments, collections } from "@/lib/firestore-helpers";
import { where } from "firebase/firestore";
import type { AutoMake, AutoModel } from "@/types/firestore";

const MakeDetail = () => {
  const { makeId } = useParams<{ makeId: string }>();
  const [make, setMake] = useState<AutoMake | null>(null);
  const [models, setModels] = useState<AutoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMake = async () => {
      if (!makeId) return;
      
      try {
        const makeData = await getDocument<AutoMake>(collections.autoMakes, makeId);
        if (makeData) {
          setMake(makeData);
        } else {
          toast({
            title: "Not found",
            description: "Car make not found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching make:", error);
        toast({
          title: "Error",
          description: "Could not load car make details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMake();
  }, [makeId, toast]);

  useEffect(() => {
    const fetchModels = async () => {
      if (!make) return;
      
      try {
        const modelsData = await queryDocuments<AutoModel>(
          collections.autoModels,
          [where("makeName", "==", make.name.toLowerCase())]
        );
        setModels(modelsData);
      } catch (error) {
        console.error("Error fetching models:", error);
        toast({
          title: "Error",
          description: "Could not load models.",
          variant: "destructive"
        });
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, [make, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!make) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Makes
            </Button>
          </Link>
          <p className="text-lg text-muted-foreground">Make not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 md:px-6">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Makes
          </Button>
        </Link>

        <div className="max-w-6xl">
          <div className="flex items-center gap-6 mb-8">
            {make.logoImage ? (
              <img 
                src={make.logoImage} 
                alt={`${make.name} logo`}
                className="w-32 h-32 object-contain"
              />
            ) : (
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                <span className="text-5xl font-bold text-muted-foreground uppercase">
                  {make.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold capitalize mb-2">{make.name}</h1>
              {make.foundedYear && (
                <p className="text-lg text-muted-foreground">
                  Founded: {make.foundedYear}
                </p>
              )}
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Models</h2>
            {modelsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : models.length === 0 ? (
              <p className="text-muted-foreground">No models found for this make.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <Card key={model.id}>
                    <CardHeader>
                      <CardTitle className="capitalize">{model.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(model.productionStartYear || model.productionEndYear) && (
                        <p className="text-sm text-muted-foreground">
                          {model.productionStartYear || '?'} - {model.productionEndYear || 'Present'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeDetail;
