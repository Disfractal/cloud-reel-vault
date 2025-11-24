import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";
import { UploadDialog } from "@/components/UploadDialog";
import { DataImporter } from "@/components/DataImporter";
import { useToast } from "@/hooks/use-toast";
import { getAllClips } from "@/lib/firestore-helpers";
import type { Clip } from "@/types/firestore";
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
    const fetchClips = async () => {
      try {
        const clips = await getAllClips();
        
        if (clips.length > 0) {
          // Transform Firestore clips to video format
          const transformedVideos = clips.map(clip => ({
            id: clip.id,
            title: `${clip.makeName} ${clip.modelName} ${clip.trimName}`,
            thumbnail: clip.makeLogoImage || "/placeholder.svg",
            duration: clip.duration || "0:00",
            size: clip.size || "0 MB",
            uploadDate: clip.createdOn?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          }));
          setVideos(transformedVideos);
        } else {
          // Fallback to mock data if Firestore is empty
          toast({
            title: "No clips found",
            description: "Database is empty. Showing sample data. Use the upload button to add clips.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error fetching clips:", error);
        toast({
          title: "Using sample data",
          description: "Could not connect to database, showing sample videos.",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClips();
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
        {videos.length === 0 && !loading && (
          <div className="mb-8">
            <DataImporter />
          </div>
        )}
        
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
