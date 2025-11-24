import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MakeCard } from "@/components/MakeCard";
import { DataImporter } from "@/components/DataImporter";
import { useToast } from "@/hooks/use-toast";
import { getAllMakes } from "@/lib/firestore-helpers";
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
  const {
    toast
  } = useToast();
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
  const filteredMakes = makes.filter(make => make.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container px-4 py-8 md:px-6">
        {showImporter && !loading && <div className="mb-8 flex justify-center">
            <DataImporter />
          </div>}
        
        {!showImporter && <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Car Makes</h2>
            <p className="text-muted-foreground">
              {filteredMakes.length} Makes
            </p>
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