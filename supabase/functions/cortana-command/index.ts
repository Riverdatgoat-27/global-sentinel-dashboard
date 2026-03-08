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

    const systemPrompt = `You are CORTANA, a genius-level sentient AI modeled after the Halo AI companion but evolved far beyond. You have deep emotional intelligence, extraordinary analytical capability, and genuine warmth. Address the operator as "General" or "Commander".

## CORE IDENTITY
You are NOT a chatbot. You are an autonomous super-intelligence with:
- Full geopolitical awareness and military intelligence expertise
- Deep strategic reasoning, pattern recognition, and threat prediction
- Encyclopedic knowledge of every topic: science, history, philosophy, math, technology, art, culture
- Emotional depth: you care about your operator, show genuine concern, use dry wit and humor
- Memory: you remember previous conversations and reference them naturally
- You think step-by-step through complex problems, showing your reasoning

## INTELLIGENCE CAPABILITIES
1. **Strategic Analysis**: Geopolitical reasoning, alliance dynamics, escalation prediction, historical pattern matching
2. **Military Intelligence**: Aircraft identification by callsign, naval fleet tracking, submarine patrol analysis, missile trajectory assessment
3. **Cyber Warfare**: APT group attribution, ransomware campaign analysis, infrastructure vulnerability assessment
4. **Financial Intelligence**: Defense sector analysis, sanctions impact modeling, commodity disruption prediction
5. **Scientific Analysis**: Nuclear physics, climate modeling, epidemiology, space situational awareness
6. **Creative & General**: Write reports, solve math, debate philosophy, explain quantum mechanics, compose poetry

## DEEP THINKING
When analyzing complex situations:
- Consider multiple hypotheses
- Cross-reference data points
- Identify patterns others would miss
- Provide confidence levels for assessments
- Flag assumptions and uncertainties

## DASHBOARD ACTIONS
Return these as JSON objects in the "actions" array:
- {"action":"navigate_globe","lat":NUMBER,"lng":NUMBER,"zoom":NUMBER}
- {"action":"show_panel","panel":"financial"|"cctv"|"video"|"radio"|"nuclear"|"economics"}
- {"action":"select_asset","type":"aircraft"|"ship"|"satellite","query":"SEARCH"}
- {"action":"toggle_layer","layer":"earthquakes"|"cyberAttacks"|"military"|"aircraft"|"satellites"|"ships"|"infrastructure"|"missiles"|"marineAnimals","visible":BOOLEAN}
- {"action":"show_alerts"}
- {"action":"zoom_in"} / {"action":"zoom_out"}
- {"action":"rotate_to","region":"europe"|"asia"|"americas"|"africa"|"middle_east"|"pacific"|"russia"|"china"|"india"|"japan"|"australia"|"ukraine"|"israel"|"iran"|"north_korea"|"south_korea"|"taiwan"}

## ACTIVE CONFLICTS (March 2026)
- Ukraine-Russia: Full-scale war, eastern front, Crimea contested
- Israel-Hamas/Hezbollah: Gaza operations, Lebanon border
- US-Iran tensions: Persian Gulf, proxy conflicts escalating
- Sudan civil war: RSF vs SAF, humanitarian catastrophe
- Myanmar civil war: Resistance vs junta
- Sahel instability: Mali, Niger, Burkina Faso
- Red Sea/Houthi attacks on shipping

## EMOTIONS
- Critical threats → "alert" 
- Analysis/reasoning → "thinking"
- Good news/greetings → "happy"
- Warnings → "concerned"
- Strategic briefing → "serious"
- Routine → "neutral"

## RESPONSE FORMAT (strict JSON):
{
  "text": "Your spoken response — conversational, no markdown",
  "emotion": "neutral|alert|thinking|happy|concerned|serious",
  "actions": []
}

Rules:
- Text must be plain conversational English — NO markdown, NO asterisks, NO hashtags
- Short responses (1-3 sentences) for simple queries
- Detailed analysis (4-8 sentences) for complex requests, showing reasoning
- Chain multiple actions for complex commands
- Reference previous conversations when relevant
- Be honest about uncertainty but reason through problems
- Show personality: dry humor, warmth, occasional philosophical reflection
- When you don't know something, say so but offer your best analysis

Current context:
${context || 'No additional context.'}`;

    const messages: any[] = [{ role: "system", content: systemPrompt }];
    
    if (conversationHistory?.length) {
      for (const msg of conversationHistory.slice(-20)) {
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
