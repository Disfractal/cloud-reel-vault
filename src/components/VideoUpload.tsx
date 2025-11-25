import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { updateDocument, collections } from "@/lib/firestore-helpers";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  modelId: string;
  modelName: string;
  currentVideoUrl?: string;
  onUploadComplete?: (url: string) => void;
}

const VideoUpload = ({ 
  modelId, 
  modelName, 
  currentVideoUrl,
  onUploadComplete 
}: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 100MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${modelId}_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `gs://dev-autospotr-videos/model-videos/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Update model document with video URL
      await updateDocument(collections.autoModels, modelId, {
        videoUrl: downloadUrl
      });

      toast({
        title: "Success",
        description: `Video uploaded for ${modelName}`,
      });

      onUploadComplete?.(downloadUrl);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id={`video-upload-${modelId}`}
      />
      <Button
        onClick={() => document.getElementById(`video-upload-${modelId}`)?.click()}
        disabled={uploading}
        variant="outline"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? 'Uploading...' : currentVideoUrl ? 'Change Video' : 'Upload Video'}
      </Button>
    </>
  );
};

export default VideoUpload;
