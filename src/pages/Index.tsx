import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";
import { UploadDialog } from "@/components/UploadDialog";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import videoThumb1 from "@/assets/video-thumb-1.jpg";
import videoThumb2 from "@/assets/video-thumb-2.jpg";
import videoThumb3 from "@/assets/video-thumb-3.jpg";
import videoThumb4 from "@/assets/video-thumb-4.jpg";
import videoThumb5 from "@/assets/video-thumb-5.jpg";
import videoThumb6 from "@/assets/video-thumb-6.jpg";

const mockVideos = [
  {
    id: "1",
    title: "2024 BMW M4 Competition - Sao Paulo Blue",
    thumbnail: videoThumb1,
    duration: "45:00",
    size: "4K",
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    title: "Porsche 911 GT3 RS - Track Day Highlights",
    thumbnail: videoThumb2,
    duration: "30:15",
    size: "1080p",
    uploadDate: "2024-01-18",
  },
  {
    id: "3",
    title: "Mercedes-AMG GT Black Series - Full Review",
    thumbnail: videoThumb3,
    duration: "52:30",
    size: "4K",
    uploadDate: "2024-01-20",
  },
  {
    id: "4",
    title: "Lamborghini Huracan STO - Canyon Drive",
    thumbnail: videoThumb4,
    duration: "38:45",
    size: "4K",
    uploadDate: "2024-01-22",
  },
  {
    id: "5",
    title: "Ferrari 296 GTB - First Drive Experience",
    thumbnail: videoThumb5,
    duration: "25:20",
    size: "1080p",
    uploadDate: "2024-01-25",
  },
  {
    id: "6",
    title: "McLaren 765LT Spider - Acceleration Tests",
    thumbnail: videoThumb6,
    duration: "42:10",
    size: "4K",
    uploadDate: "2024-01-28",
  },
];

const Index = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState(mockVideos);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const carsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as typeof mockVideos;
        
        if (carsData.length > 0) {
          setVideos(carsData);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
        toast({
          title: "Error",
          description: "Failed to load cars from Firebase. Using local data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [toast]);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoPlay = (videoTitle: string) => {
    toast({
      title: "Playing Car Video",
      description: videoTitle,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUploadClick={() => setUploadDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container px-4 py-8 md:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Car Spotting Collection</h2>
          <p className="text-muted-foreground">
            {filteredVideos.length} car video{filteredVideos.length !== 1 ? "s" : ""} stored in Google Cloud Storage
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-lg text-muted-foreground">Loading cars...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">No car videos found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => handleVideoPlay(video.title)}
              />
            ))}
          </div>
        )}
      </main>

      <UploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  );
};

export default Index;
