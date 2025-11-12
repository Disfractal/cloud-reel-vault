import { useState } from "react";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";
import { UploadDialog } from "@/components/UploadDialog";
import { useToast } from "@/hooks/use-toast";
import videoThumb1 from "@/assets/video-thumb-1.jpg";
import videoThumb2 from "@/assets/video-thumb-2.jpg";
import videoThumb3 from "@/assets/video-thumb-3.jpg";
import videoThumb4 from "@/assets/video-thumb-4.jpg";
import videoThumb5 from "@/assets/video-thumb-5.jpg";
import videoThumb6 from "@/assets/video-thumb-6.jpg";

const mockVideos = [
  {
    id: "1",
    title: "Q4 Business Review Presentation 2024",
    thumbnail: videoThumb1,
    duration: "12:34",
    size: "145 MB",
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    title: "Product Demo - Cloud Storage Integration",
    thumbnail: videoThumb2,
    duration: "8:15",
    size: "98 MB",
    uploadDate: "2024-01-18",
  },
  {
    id: "3",
    title: "Development Tutorial: Getting Started with GCP",
    thumbnail: videoThumb3,
    duration: "25:48",
    size: "312 MB",
    uploadDate: "2024-01-20",
  },
  {
    id: "4",
    title: "Live Webinar Recording - Cloud Architecture Best Practices",
    thumbnail: videoThumb4,
    duration: "45:20",
    size: "567 MB",
    uploadDate: "2024-01-22",
  },
  {
    id: "5",
    title: "Marketing Campaign Video 2024",
    thumbnail: videoThumb5,
    duration: "3:42",
    size: "52 MB",
    uploadDate: "2024-01-25",
  },
  {
    id: "6",
    title: "Employee Training Module - Security Protocols",
    thumbnail: videoThumb6,
    duration: "18:30",
    size: "215 MB",
    uploadDate: "2024-01-28",
  },
];

const Index = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredVideos = mockVideos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoPlay = (videoTitle: string) => {
    toast({
      title: "Playing Video",
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
          <h2 className="text-2xl font-bold text-foreground">Video Library</h2>
          <p className="text-muted-foreground">
            {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} stored in Google Cloud Storage
          </p>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">No videos found</p>
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
