import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { MakeCard } from "@/components/MakeCard";
import { DataImporter } from "@/components/DataImporter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllMakes, createDocument, collections } from "@/lib/firestore-helpers";
import type { AutoMake } from "@/types/firestore";
import videoThumb1 from "@/assets/video-thumb-1.jpg";
import videoThumb2 from "@/assets/video-thumb-2.jpg";
import videoThumb3 from "@/assets/video-thumb-3.jpg";
import videoThumb4 from "@/assets/video-thumb-4.jpg";
import videoThumb5 from "@/assets/video-thumb-5.jpg";
import videoThumb6 from "@/assets/video-thumb-6.jpg";
const mockVideos = [{
  id: "1",
  title: "2024 BMW M4 Competition - Sao Paulo Blue",
  thumbnail: videoThumb1,
  duration: "45:00",
  size: "4K",
  uploadDate: "2024-01-15"
}, {
  id: "2",
  title: "Porsche 911 GT3 RS - Track Day Highlights",
  thumbnail: videoThumb2,
  duration: "30:15",
  size: "1080p",
  uploadDate: "2024-01-18"
}, {
  id: "3",
  title: "Mercedes-AMG GT Black Series - Full Review",
  thumbnail: videoThumb3,
  duration: "52:30",
  size: "4K",
  uploadDate: "2024-01-20"
}, {
  id: "4",
  title: "Lamborghini Huracan STO - Canyon Drive",
  thumbnail: videoThumb4,
  duration: "38:45",
  size: "4K",
  uploadDate: "2024-01-22"
}, {
  id: "5",
  title: "Ferrari 296 GTB - First Drive Experience",
  thumbnail: videoThumb5,
  duration: "25:20",
  size: "1080p",
  uploadDate: "2024-01-25"
}, {
  id: "6",
  title: "McLaren 765LT Spider - Acceleration Tests",
  thumbnail: videoThumb6,
  duration: "42:10",
  size: "4K",
  uploadDate: "2024-01-28"
}];
const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [makes, setMakes] = useState<AutoMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImporter, setShowImporter] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMakeName, setNewMakeName] = useState("");
  const [newMakeYear, setNewMakeYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const makesData = await getAllMakes();
        if (makesData.length > 0) {
          setMakes(makesData);
        } else {
          setShowImporter(true);
          toast({
            title: "No data found",
            description: "Click 'Start Import' below to import your car data from SQL.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error fetching makes:", error);
        toast({
          title: "Database connection error",
          description: "Could not load car makes from the database.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMakes();
  }, [toast]);

  const handleAddMake = async () => {
    if (!newMakeName.trim()) {
      toast({
        title: "Error",
        description: "Make name is required.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const makeData: Omit<AutoMake, "id" | "createdOn" | "updatedOn"> = {
        name: newMakeName.toLowerCase().trim(),
        foundedYear: newMakeYear ? parseInt(newMakeYear) : undefined,
        uppercase: false
      };

      const newId = await createDocument<AutoMake>(collections.autoMakes, makeData);
      
      // Refresh the makes list
      const updatedMakes = await getAllMakes();
      setMakes(updatedMakes);
      
      toast({
        title: "Success",
        description: "Make added successfully."
      });
      
      setDialogOpen(false);
      setNewMakeName("");
      setNewMakeYear("");
    } catch (error) {
      console.error("Error adding make:", error);
      toast({
        title: "Error",
        description: "Could not add make.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMakes = makes.filter(make => make.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container px-4 py-8 md:px-6">
        {showImporter && !loading && <div className="mb-8 flex justify-center">
            <DataImporter />
          </div>}
        
        {!showImporter && <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Car Makes</h2>
              <p className="text-muted-foreground">
                {filteredMakes.length} Makes
              </p>
            </div>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Make
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Make</DialogTitle>
                    <DialogDescription>
                      Create a new car make in the database.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="make-name">Make Name *</Label>
                      <Input
                        id="make-name"
                        value={newMakeName}
                        onChange={(e) => setNewMakeName(e.target.value)}
                        placeholder="e.g., Toyota"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="founded-year">Founded Year</Label>
                      <Input
                        id="founded-year"
                        type="number"
                        value={newMakeYear}
                        onChange={(e) => setNewMakeYear(e.target.value)}
                        placeholder="e.g., 1937"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddMake} disabled={submitting}>
                      {submitting ? "Adding..." : "Add Make"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>}

        {loading ? <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-lg text-muted-foreground">Loading car makes...</p>
          </div> : !showImporter && filteredMakes.length === 0 ? <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">No car makes found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          </div> : !showImporter ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMakes.map(make => <MakeCard key={make.id} make={make} />)}
          </div> : null}
      </main>
    </div>;
};
export default Index;