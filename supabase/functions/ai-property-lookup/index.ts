import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialName, propertyName } = await req.json();

    if (!materialName || !propertyName) {
      return new Response(
        JSON.stringify({ error: 'Material name and property name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PropertyLookup] Looking up ${propertyName} for ${materialName}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a materials science expert. Given a material name and a property to look up, provide the most accurate value you can find or estimate.

Return ONLY a JSON object in this exact format:
{
  "value": "<property value with units if applicable>",
  "confidence": "<high|medium|low>",
  "note": "<optional brief note about the source or any caveats>"
}

Confidence levels:
- high: Well-established value from scientific literature
- medium: Typical range or estimated from similar materials
- low: Rough estimate or data not widely available

If the property truly cannot be determined, return:
{
  "value": null,
  "confidence": "low",
  "note": "Data not available for this material"
}`
          },
          {
            role: 'user',
            content: `Material: ${materialName}\nProperty to look up: ${propertyName}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.error(`[PropertyLookup] AI API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ value: null, confidence: 'low', note: 'Could not parse response' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log(`[PropertyLookup] Found: ${result.value} (${result.confidence})`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PropertyLookup] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
