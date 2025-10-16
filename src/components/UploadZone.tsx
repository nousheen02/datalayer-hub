import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const UploadZone = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setProgress(30);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProgress(50);

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: file.name,
          file_type: fileExt || 'unknown',
          file_path: filePath,
          file_size: file.size,
          status: 'processing'
        })
        .select()
        .single();

      if (docError) throw docError;

      setProgress(70);

      // Read file content
      const text = await file.text();
      
      setProgress(80);

      // Extract knowledge
      const { data: functionData, error: functionError } = await supabase.functions.invoke('extract-knowledge', {
        body: { 
          documentId: document.id,
          content: text,
          fileType: fileExt
        }
      });

      if (functionError) throw functionError;

      setProgress(100);

      toast({
        title: "Success!",
        description: "Document processed and insights extracted.",
      });

      // Reload page to show new document
      setTimeout(() => window.location.reload(), 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to process document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Processing document...</p>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <File className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isDragActive ? 'Drop file here' : 'Drag & drop or click'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, TXT, or CSV files
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};