import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { collections } from "@/lib/firestore-helpers";

interface HeroImageUploadProps {
  makeId: string;
  makeName: string;
  currentHeroImage?: string;
  onUploadComplete: (url: string) => void;
}

export function HeroImageUpload({ 
  makeId, 
  makeName, 
  currentHeroImage,
  onUploadComplete 
}: HeroImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `make-heroes/${makeId}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore document
      const makeRef = doc(db, collections.autoMakes, makeId);
      await updateDoc(makeRef, {
        heroImage: downloadURL
      });

      onUploadComplete(downloadURL);

      toast({
        title: "Success",
        description: "Hero image uploaded successfully."
      });
    } catch (error) {
      console.error("Error uploading hero image:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload hero image.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        id="hero-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById("hero-upload")?.click()}
        disabled={uploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : currentHeroImage ? "Change Hero Image" : "Upload Hero Image"}
      </Button>
    </div>
  );
}
