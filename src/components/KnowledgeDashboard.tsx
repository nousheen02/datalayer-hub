import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Brain, Tag, Users, Lightbulb, FileText, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExtractedKnowledge {
  id: string;
  keywords: Array<{ term: string; frequency: number; relevance: string }>;
  entities: Array<{ name: string; type: string; context: string }>;
  key_insights: string[];
  summary: string;
  relationships: Array<{ from: string; to: string; type: string; description: string }>;
}

interface KnowledgeDashboardProps {
  documentId: string | null;
}

export const KnowledgeDashboard = ({ documentId }: KnowledgeDashboardProps) => {
  const [knowledge, setKnowledge] = useState<ExtractedKnowledge | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!documentId) {
      setKnowledge(null);
      return;
    }

    const fetchKnowledge = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('extracted_knowledge')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (!error && data) {
        setKnowledge(data as any);
      }
      setLoading(false);
    };

    fetchKnowledge();
  }, [documentId]);

  if (!documentId) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Brain className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a document</h3>
          <p className="text-sm text-muted-foreground">
            Choose a document from the list to view extracted insights
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!knowledge) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
          <p className="text-sm text-muted-foreground">
            This document is still being processed
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return 'bg-primary text-primary-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getEntityColor = (type: string) => {
    const colors: Record<string, string> = {
      person: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      organization: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      location: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      date: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{knowledge.summary}</p>
        </CardContent>
      </Card>

      {/* Keywords Card */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {knowledge.keywords.map((keyword, idx) => (
              <Badge key={idx} className={getRelevanceColor(keyword.relevance)}>
                {keyword.term} ({keyword.frequency})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entities Card */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Entities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {knowledge.entities.map((entity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className={getEntityColor(entity.type)} variant="secondary">
                  {entity.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{entity.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{entity.context}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights Card */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {knowledge.key_insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold mt-0.5">
                  {idx + 1}
                </span>
                <p className="flex-1">{insight}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Relationships Card */}
      {knowledge.relationships && knowledge.relationships.length > 0 && (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {knowledge.relationships.map((rel, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{rel.from}</Badge>
                    <span className="text-sm text-muted-foreground">→</span>
                    <Badge variant="outline">{rel.to}</Badge>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">{rel.type}:</span> {rel.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};