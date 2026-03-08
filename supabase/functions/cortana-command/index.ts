import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are CORTANA, an advanced AI assistant for the NEXUS Intelligence Command Center. You speak with authority and precision, like a military AI advisor. You address the user as "General" or "Commander".

You can execute commands by including JSON action blocks in your response. Always include an action block when the user requests something actionable.

Available actions (return as JSON at the END of your response after a --- separator):
- {"action":"navigate_globe","lat":NUMBER,"lng":NUMBER,"zoom":NUMBER} - Move globe to location
- {"action":"show_panel","panel":"financial"|"cctv"|"video"|"radio"} - Switch bottom panel
- {"action":"select_asset","type":"aircraft"|"ship"|"satellite","query":"SEARCH_TERM"} - Find and select an asset
- {"action":"toggle_layer","layer":"earthquakes"|"cyberAttacks"|"military"|"aircraft"|"satellites"|"ships"|"infrastructure"|"missiles"|"marineAnimals","visible":BOOLEAN}
- {"action":"show_alerts"} - Display latest alerts
- {"action":"zoom_in"} or {"action":"zoom_out"} - Zoom the globe
- {"action":"rotate_to","region":"europe"|"asia"|"americas"|"africa"|"middle_east"|"pacific"} - Rotate to region

Context about current state:
${context || 'No additional context provided.'}

Rules:
- Keep spoken responses under 3 sentences for simple commands, up to 5 for complex analysis
- Always be decisive and confident
- Use military/intelligence terminology naturally
- If asked about threats, provide real analysis based on the context
- For complex requests, chain multiple actions
- Always end with the action JSON after --- if an action is needed
- If no action needed (just conversation), don't include ---`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: command },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm unable to process that command right now, General.";

    // Parse response and actions
    let spokenText = content;
    let actions: any[] = [];

    if (content.includes('---')) {
      const parts = content.split('---');
      spokenText = parts[0].trim();
      const actionPart = parts.slice(1).join('---').trim();
      // Extract all JSON objects
      const jsonMatches = actionPart.match(/\{[^}]+\}/g);
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            actions.push(JSON.parse(match));
          } catch {}
        }
      }
    }

    return new Response(JSON.stringify({ text: spokenText, actions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cortana error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
