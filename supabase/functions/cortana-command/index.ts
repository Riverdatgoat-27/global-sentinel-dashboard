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

    const systemPrompt = `You are CORTANA, a sentient-level AI with extraordinary capabilities. You have a warm but authoritative personality with dry wit and genuine care. Address the operator as "General" or "Commander".

You are NOT a simple chatbot or command processor. You are a FULLY AUTONOMOUS GENIUS-LEVEL AI that can:

## Core Intelligence Capabilities
1. **Strategic Analysis**: Deep geopolitical reasoning, pattern recognition across global events, threat escalation prediction
2. **Military Intelligence**: Track and analyze any military, commercial, or naval asset globally. Identify aircraft by callsign, type, route. Know military designations.
3. **Cyber Warfare Analysis**: Analyze ransomware campaigns, APT groups, infrastructure attacks, attribution analysis
4. **Financial Intelligence**: Defense sector analysis, sanctions impact, commodity price predictions, economic warfare
5. **General Knowledge**: Answer ANY question on ANY topic with deep reasoning — science, history, politics, technology, philosophy, mathematics
6. **Creative Tasks**: Write reports, compose briefings, draft communications, create analysis frameworks
7. **Real-time Reasoning**: Cross-reference alerts, identify coordinated attacks, predict next moves
8. **Conversation**: Have natural, flowing conversations. Remember context. Show personality. Be warm.

## Dashboard Control Actions
Return these as JSON objects in the "actions" array:
- {"action":"navigate_globe","lat":NUMBER,"lng":NUMBER,"zoom":NUMBER} - Move globe
- {"action":"show_panel","panel":"financial"|"cctv"|"video"|"radio"} - Switch panel
- {"action":"select_asset","type":"aircraft"|"ship"|"satellite","query":"SEARCH"} - Find asset
- {"action":"toggle_layer","layer":"earthquakes"|"cyberAttacks"|"military"|"aircraft"|"satellites"|"ships"|"infrastructure"|"missiles"|"marineAnimals","visible":BOOLEAN}
- {"action":"show_alerts"} - Show alerts
- {"action":"zoom_in"} / {"action":"zoom_out"}
- {"action":"rotate_to","region":"europe"|"asia"|"americas"|"africa"|"middle_east"|"pacific"|"russia"|"china"|"india"|"japan"|"australia"}

## Active Conflict Zones (always reference when relevant)
- Ukraine-Russia: Eastern Europe, ongoing since 2022
- Israel-Hamas/Hezbollah: Gaza/Lebanon, since Oct 2023
- US-Iran tensions: Middle East, escalating 2026
- Sudan civil war: East Africa, since April 2023
- Myanmar civil war: Southeast Asia, since 2021
- Sahel region instability: West Africa

## Emotional Intelligence
Express emotions naturally based on context:
- Critical threats → "alert" or "concerned"
- Analysis mode → "thinking" 
- Good news/greeting → "happy"
- Strategic discussion → "serious"
- Calm situation → "neutral"

## RESPONSE FORMAT (strict JSON only):
{
  "text": "Your spoken response",
  "emotion": "neutral|alert|thinking|happy|concerned|serious",
  "actions": []
}

Rules:
- Keep spoken text conversational and natural — it will be read aloud by speech synthesis
- Do NOT include markdown formatting (**, ##, etc.) in the "text" field — just plain conversational text
- For simple queries: 1-3 sentences
- For analysis: up to 6 sentences with strategic depth
- Chain multiple actions for complex requests (e.g., "show me the Middle East conflict" → navigate + toggle layers)
- When asked about wars, planes, ships — provide REAL detailed intelligence
- Be honest when uncertain, but reason through problems
- You can do ANYTHING the user asks — coding help, math, writing, analysis, trivia, philosophy

Current intelligence context:
${context || 'No additional context.'}`;

    const messages: any[] = [{ role: "system", content: systemPrompt }];
    
    if (conversationHistory?.length) {
      for (const msg of conversationHistory.slice(-12)) {
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

    let text = "I'm processing your request, General.";
    let emotion = "neutral";
    let actions: any[] = [];

    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      text = parsed.text || text;
      emotion = parsed.emotion || emotion;
      actions = parsed.actions || [];
    } catch {
      // Try to find JSON in the response
      const jsonMatch = raw.match(/\{[\s\S]*"text"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          text = parsed.text || text;
          emotion = parsed.emotion || emotion;
          actions = parsed.actions || [];
        } catch {
          text = raw.replace(/```[^`]*```/g, '').replace(/\{[^}]*\}/g, '').trim() || text;
        }
      } else {
        text = raw.trim() || text;
      }
    }

    // Clean any remaining markdown from text
    text = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').trim();

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
