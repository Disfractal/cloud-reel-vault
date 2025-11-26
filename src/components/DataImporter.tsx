import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { importDataToFirestore } from "@/lib/import-firestore-data";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";

export function DataImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [stats, setStats] = useState<{ makesImported: number; modelsImported: number } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      // Fetch the SQL file
      const response = await fetch("/src/lib/import-data.sql");
      const sqlContent = await response.text();
      
      toast.info("Starting data import...");
      
      const result = await importDataToFirestore(sqlContent);
      
      setStats(result);
      setImportComplete(true);
      toast.success(`Successfully imported ${result.makesImported} makes and ${result.modelsImported} models!`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data. Check console for details.");
    } finally {
      setIsImporting(false);
    }
  };

  if (importComplete && stats) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>Import Complete!</CardTitle>
          </div>
          <CardDescription>Your data has been successfully imported</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Makes imported:</strong> {stats.makesImported}
          </p>
          <p className="text-sm">
            <strong>Models imported:</strong> {stats.modelsImported}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4"
          >
            Reload Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Import Your Data</CardTitle>
        <CardDescription>
          Import car makes and models from your SQL database into Firestore
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Start Import
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          This will parse your SQL file and import all car makes and models into Firestore.
          Existing data will not be duplicated.
        </p>
      </CardContent>
    </Card>
  );
}
