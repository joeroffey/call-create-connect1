import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, projectName, projectDescription, projectType } = await req.json();

    console.log(`Generating project plan for: ${projectName}`);

    const prompt = `
You are a construction project management expert. Generate a realistic project plan with phases for the following project:

Project Name: ${projectName}
Project Type: ${projectType || 'General Construction'}
Description: ${projectDescription || 'No description provided'}

Generate 5-8 logical project phases with realistic timelines. Each phase should include:
- phase_name: A clear, professional phase name
- duration_days: Realistic duration in days
- description: Brief description of what happens in this phase
- dependencies: Which phases must complete before this one starts (use phase indices)

Consider typical construction workflows like: Planning/Design, Permits, Site Preparation, Foundation, Structural Work, Systems Installation, Finishing, Final Inspection.

Return ONLY a valid JSON array of phases, no other text:
[
  {
    "phase_name": "Planning & Design",
    "duration_days": 14,
    "description": "Project planning, design review, and material ordering",
    "dependencies": []
  },
  ...
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a construction project management expert. Return only valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const generatedPlan = aiData.choices[0].message.content;

    console.log('AI generated plan:', generatedPlan);

    // Parse the AI response
    let phases;
    try {
      phases = JSON.parse(generatedPlan);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback to default phases
      phases = [
        {
          phase_name: "Planning & Design",
          duration_days: 14,
          description: "Project planning, design review, and material ordering",
          dependencies: []
        },
        {
          phase_name: "Permits & Approvals",
          duration_days: 21,
          description: "Obtain necessary permits and regulatory approvals",
          dependencies: [0]
        },
        {
          phase_name: "Site Preparation",
          duration_days: 7,
          description: "Site clearing, access preparation, and utility marking",
          dependencies: [1]
        },
        {
          phase_name: "Foundation Work",
          duration_days: 14,
          description: "Excavation, foundation pouring, and curing",
          dependencies: [2]
        },
        {
          phase_name: "Completion & Handover",
          duration_days: 7,
          description: "Final inspections, cleanup, and project handover",
          dependencies: [3]
        }
      ];
    }

    return new Response(JSON.stringify({ phases }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-project-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});