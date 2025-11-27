import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getDocument, queryDocuments, collections, updateDocument, createDocument } from "@/lib/firestore-helpers";
import { where } from "firebase/firestore";
import type { AutoMake, AutoModel } from "@/types/firestore";
import { HeroImageUpload } from "@/components/HeroImageUpload";

const MakeDetail = () => {
  const { makeId } = useParams<{ makeId: string }>();
  const [make, setMake] = useState<AutoMake | null>(null);
  const [models, setModels] = useState<AutoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [productionStartYear, setProductionStartYear] = useState("");
  const [productionEndYear, setProductionEndYear] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

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
        const sortedModels = modelsData.sort((a, b) => a.name.localeCompare(b.name));
        setModels(sortedModels);
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

  const handleUppercaseToggle = async (checked: boolean) => {
    if (!make || !isAdmin) return;
    
    try {
      await updateDocument<AutoMake>(collections.autoMakes, make.id, {
        uppercase: checked
      });
      setMake({ ...make, uppercase: checked });
      toast({
        title: "Updated",
        description: "Uppercase setting saved successfully."
      });
    } catch (error) {
      console.error("Error updating uppercase setting:", error);
      toast({
        title: "Error",
        description: "Could not update uppercase setting.",
        variant: "destructive"
      });
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !newModelName.trim()) return;
    
    setCreating(true);
    try {
      const modelData = {
        name: newModelName.trim().toLowerCase(),
        makeId: make.id,
        makeName: make.name.toLowerCase(),
        ...(productionStartYear && { productionStartYear: parseInt(productionStartYear) }),
        ...(productionEndYear && { productionEndYear: parseInt(productionEndYear) }),
        uppercase: false
      };

      await createDocument<Omit<AutoModel, "id" | "createdOn" | "updatedOn">>(
        collections.autoModels,
        modelData
      );

      toast({
        title: "Success",
        description: "Model created successfully."
      });

      // Reset form and close dialog
      setNewModelName("");
      setProductionStartYear("");
      setProductionEndYear("");
      setDialogOpen(false);

      // Refresh models list
      const modelsData = await queryDocuments<AutoModel>(
        collections.autoModels,
        [where("makeName", "==", make.name.toLowerCase())]
      );
      const sortedModels = modelsData.sort((a, b) => a.name.localeCompare(b.name));
      setModels(sortedModels);
    } catch (error) {
      console.error("Error creating model:", error);
      toast({
        title: "Error",
        description: "Could not create model.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
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

  if (!make) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <Link to="/makes">
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
        <Link to="/makes">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Makes
          </Button>
        </Link>

        <div className="max-w-6xl">
          {make.heroImage && (
            <div className="mb-8 rounded-lg overflow-hidden aspect-[42/9]">
              <img 
                src={make.heroImage} 
                alt={`${make.name} hero`}
                className="w-full h-full object-contain"
              />
            </div>
          )}

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
            <div className="flex-1">
              <h1 className={`text-4xl font-bold mb-2 ${make.uppercase ? 'uppercase' : 'capitalize'}`}>
                {make.name}
              </h1>
              {make.foundedYear && (
                <p className="text-lg text-muted-foreground">
                  Founded: {make.foundedYear}
                </p>
              )}
            </div>
            {isAdmin && (
              <div className="flex flex-col gap-4">
                <HeroImageUpload 
                  makeId={make.id}
                  makeName={make.name}
                  currentHeroImage={make.heroImage}
                  onUploadComplete={(url) => setMake({ ...make, heroImage: url })}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="uppercase-mode"
                    checked={make.uppercase || false}
                    onCheckedChange={handleUppercaseToggle}
                  />
                  <Label htmlFor="uppercase-mode">Uppercase</Label>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Models</h2>
              {isAdmin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Model
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Model</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateModel} className="space-y-4">
                      <div>
                        <Label htmlFor="modelName">Model Name *</Label>
                        <Input
                          id="modelName"
                          value={newModelName}
                          onChange={(e) => setNewModelName(e.target.value)}
                          placeholder="e.g., Civic"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startYear">Production Start Year</Label>
                        <Input
                          id="startYear"
                          type="number"
                          value={productionStartYear}
                          onChange={(e) => setProductionStartYear(e.target.value)}
                          placeholder="e.g., 2020"
                          min="1800"
                          max="2100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endYear">Production End Year</Label>
                        <Input
                          id="endYear"
                          type="number"
                          value={productionEndYear}
                          onChange={(e) => setProductionEndYear(e.target.value)}
                          placeholder="Leave empty if still in production"
                          min="1800"
                          max="2100"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          disabled={creating}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={creating || !newModelName.trim()}>
                          {creating ? "Creating..." : "Create Model"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
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
                  <Link key={model.id} to={`/model/${model.id}`}>
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className={model.uppercase ? 'uppercase' : 'capitalize'}>{model.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(model.productionStartYear || model.productionEndYear) && (
                          <p className="text-sm text-muted-foreground">
                            {model.productionStartYear || '?'} - {model.productionEndYear || 'Present'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
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
