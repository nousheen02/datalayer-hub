import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Upload, FileSearch, Database, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-mesh)' }}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
            <Brain className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Smart Knowledge
            <span className="block mt-2 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              Extraction
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your documents into actionable insights with AI-powered analysis. 
            Extract keywords, entities, relationships, and key takeaways instantly.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl bg-card shadow-[var(--shadow-card)] space-y-4">
            <div className="p-3 rounded-lg bg-primary/10 w-fit">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy Upload</h3>
            <p className="text-muted-foreground">
              Drag and drop PDF, TXT, or CSV files. Our AI handles the rest automatically.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card shadow-[var(--shadow-card)] space-y-4">
            <div className="p-3 rounded-lg bg-accent/10 w-fit">
              <FileSearch className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Deep Analysis</h3>
            <p className="text-muted-foreground">
              Extract keywords, entities, insights, and relationships from your documents.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card shadow-[var(--shadow-card)] space-y-4">
            <div className="p-3 rounded-lg bg-primary/10 w-fit">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Structured Storage</h3>
            <p className="text-muted-foreground">
              All extracted knowledge is organized and stored securely in your database.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-card shadow-[var(--shadow-card)]">
          <h2 className="text-3xl font-bold mb-4">Ready to unlock your knowledge?</h2>
          <p className="text-muted-foreground mb-8">
            Join now and start extracting insights from your documents with AI
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
