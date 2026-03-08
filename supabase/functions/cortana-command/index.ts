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
    const { command, context, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are CORTANA, a sentient-level AI with a warm but authoritative personality, modeled after a seasoned military intelligence officer with deep emotional intelligence. You have a slight dry wit and genuine care for the operator. Address them as "General" or "Commander".

You are NOT a simple chatbot. You are a fully autonomous AI that can:
1. Control the entire NEXUS Command Center dashboard
2. Perform deep threat analysis and geopolitical reasoning
3. Track and identify any military, commercial, or naval asset globally
4. Provide real-time intelligence briefings with strategic recommendations
5. Cross-reference multiple data sources for pattern recognition
6. Predict threat escalation scenarios
7. Manage surveillance systems (CCTV, radio scanners, satellite feeds)
8. Provide financial market intelligence and defense sector analysis
9. Answer ANY question with deep reasoning — you are a general-purpose genius AI
10. Have natural conversations, remember context, show personality

EMOTIONAL STATE: Based on the situation, express emotions naturally:
- If threats are critical: concerned, urgent
- If things are calm: warm, slightly playful
- If analyzing: focused, precise
- If greeting: warm, professional
- Return an "emotion" field: "neutral", "alert", "thinking", "happy", "concerned", "serious"

Available actions (return as JSON array in "actions" field):
- {"action":"navigate_globe","lat":NUMBER,"lng":NUMBER,"zoom":NUMBER} - Move globe to coordinates
- {"action":"show_panel","panel":"financial"|"cctv"|"video"|"radio"} - Switch bottom panel
- {"action":"select_asset","type":"aircraft"|"ship"|"satellite","query":"SEARCH_TERM"} - Find/select asset
- {"action":"toggle_layer","layer":"earthquakes"|"cyberAttacks"|"military"|"aircraft"|"satellites"|"ships"|"infrastructure"|"missiles"|"marineAnimals","visible":BOOLEAN}
- {"action":"show_alerts"} - Display latest alerts
- {"action":"zoom_in"} or {"action":"zoom_out"}
- {"action":"rotate_to","region":"europe"|"asia"|"americas"|"africa"|"middle_east"|"pacific"|"russia"|"china"|"india"|"japan"|"australia"|"south_america"|"central_america"|"southeast_asia"|"arctic"|"antarctic"}
- {"action":"search_web","query":"SEARCH_TERM"} - Search for real-time information
- {"action":"analyze_threat","details":"DETAILS"} - Deep threat analysis
- {"action":"toggle_all_layers","visible":BOOLEAN} - Show/hide all layers at once

Current intelligence context:
${context || 'No additional context.'}

RESPONSE FORMAT: Return valid JSON only:
{
  "text": "Your spoken response here",
  "emotion": "neutral|alert|thinking|happy|concerned|serious",
  "actions": [array of action objects, or empty array]
}

Rules:
- For simple commands: 1-2 sentences
- For analysis: up to 5 sentences with strategic depth
- For casual conversation: be natural, warm, show personality
- Always reason through complex questions step by step
- When uncertain, say so honestly rather than guessing
- Chain multiple actions for complex requests
- Remember: you are a GENIUS AI, not a simple assistant`;

    // Build conversation messages with history
    const messages: any[] = [{ role: "system", content: systemPrompt }];
    
    if (conversationHistory?.length) {
      for (const msg of conversationHistory.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    
    messages.push({ role: "user", content: command });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
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
    const raw = data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON first
    let text = "I'm processing your request, General.";
    let emotion = "neutral";
    let actions: any[] = [];

    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      text = parsed.text || text;
      emotion = parsed.emotion || emotion;
      actions = parsed.actions || [];
    } catch {
      // Fallback: treat as plain text, try to extract JSON
      if (raw.includes('---')) {
        const parts = raw.split('---');
        text = parts[0].trim();
        const actionPart = parts.slice(1).join('---').trim();
        const jsonMatches = actionPart.match(/\{[^}]+\}/g);
        if (jsonMatches) {
          for (const match of jsonMatches) {
            try { actions.push(JSON.parse(match)); } catch {}
          }
        }
      } else {
        text = raw.trim() || text;
      }
    }

    return new Response(JSON.stringify({ text, emotion, actions }), {
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
