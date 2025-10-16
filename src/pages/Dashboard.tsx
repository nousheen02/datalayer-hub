import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Upload, LogOut } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { DocumentsList } from "@/components/DocumentsList";
import { KnowledgeDashboard } from "@/components/KnowledgeDashboard";

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-mesh)' }}>
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Smart Knowledge Extraction</h1>
              <p className="text-sm text-muted-foreground">AI-powered document analysis</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Documents */}
          <div className="lg:col-span-1 space-y-6">
            <UploadZone />
            <DocumentsList 
              onSelectDocument={setSelectedDocument}
              selectedDocument={selectedDocument}
            />
          </div>

          {/* Right Column - Knowledge Dashboard */}
          <div className="lg:col-span-2">
            <KnowledgeDashboard documentId={selectedDocument} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;