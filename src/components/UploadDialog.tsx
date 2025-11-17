import { useState, useCallback } from "react";
import { Upload, X, FileVideo } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadDialog = ({ open, onOpenChange }: UploadDialogProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith("video/")
    );
    
    if (files.length > 0) {
      toast({
        title: "Upload Started",
        description: `Uploading ${files.length} car video${files.length > 1 ? 's' : ''} to Google Cloud Storage...`,
      });
      // Simulate upload
      setTimeout(() => {
        toast({
          title: "Upload Complete",
          description: "Car videos have been uploaded successfully.",
        });
        onOpenChange(false);
      }, 2000);
    }
  }, [toast, onOpenChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      toast({
        title: "Upload Started",
        description: `Uploading ${files.length} car video${files.length > 1 ? 's' : ''} to Google Cloud Storage...`,
      });
      setTimeout(() => {
        toast({
          title: "Upload Complete",
          description: "Car videos have been uploaded successfully.",
        });
        onOpenChange(false);
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Car Videos</DialogTitle>
          <DialogDescription>
            Upload your car spotting videos to Google Cloud Storage
          </DialogDescription>
        </DialogHeader>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative mt-4 flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30"
          }`}
        >
          <FileVideo className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Drag and drop car videos here
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            or click to browse files
          </p>
          
          <label htmlFor="file-upload">
            <Button asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="mt-6 text-xs text-muted-foreground">
            Supported formats: MP4, MOV, AVI, WebM
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
