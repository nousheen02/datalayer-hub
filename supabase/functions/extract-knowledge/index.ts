import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, content, fileType } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting knowledge from document:', documentId);

    // Call Lovable AI for knowledge extraction
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert knowledge extraction system. Analyze documents and extract:
1. Keywords (important terms and concepts)
2. Entities (people, organizations, locations, dates)
3. Key insights (main takeaways and important points)
4. Summary (concise overview)
5. Relationships (connections between entities and concepts)

Return the results as JSON with this structure:
{
  "keywords": [{"term": "string", "frequency": number, "relevance": "high"|"medium"|"low"}],
  "entities": [{"name": "string", "type": "person"|"organization"|"location"|"date"|"other", "context": "string"}],
  "key_insights": ["string"],
  "summary": "string",
  "relationships": [{"from": "string", "to": "string", "type": "string", "description": "string"}]
}`
          },
          {
            role: 'user',
            content: `Extract knowledge from this ${fileType} document:\n\n${content}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const extractedData = JSON.parse(aiData.choices[0].message.content);

    console.log('Extracted data:', extractedData);

    // Store extracted knowledge in database
    const { data: knowledge, error: insertError } = await supabase
      .from('extracted_knowledge')
      .insert({
        document_id: documentId,
        user_id: user.id,
        keywords: extractedData.keywords || [],
        entities: extractedData.entities || [],
        key_insights: extractedData.key_insights || [],
        summary: extractedData.summary || '',
        relationships: extractedData.relationships || []
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    // Update document status
    await supabase
      .from('documents')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return new Response(
      JSON.stringify({ success: true, knowledge }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-knowledge function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});