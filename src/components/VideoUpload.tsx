import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { updateDocument, collections } from "@/lib/firestore-helpers";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setUploadProgress(0);

    try {
      // Upload to Firebase Storage with progress tracking
      const timestamp = Date.now();
      const fileName = `${modelId}_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `model-videos/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Track upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Error uploading video:", error);
          toast({
            title: "Upload failed",
            description: "Could not upload video. Please try again.",
            variant: "destructive"
          });
          setUploading(false);
          setUploadProgress(0);
        },
        async () => {
          // Upload complete
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Update model document with video URL
          await updateDocument(collections.autoModels, modelId, {
            videoUrl: downloadUrl
          });

          toast({
            title: "Success",
            description: `Video uploaded for ${modelName}`,
          });

          onUploadComplete?.(downloadUrl);
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload video. Please try again.",
        variant: "destructive"
      });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-2">
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
        {uploading ? `Uploading... ${uploadProgress}%` : currentVideoUrl ? 'Change Video' : 'Upload Video'}
      </Button>
      {uploading && (
        <div className="w-full">
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
