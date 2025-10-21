// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // In a real app, we'd process an image from the request body.
    // For this simulation, we'll return a hardcoded mock response.
    const mockRecognitionData = {
      foods: [
        { 
          name: "Grilled Chicken Breast", 
          confidence: 0.95, 
          nutrition: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
            serving_size: '100g',
          }
        },
        { 
          name: "Broccoli", 
          confidence: 0.88, 
          nutrition: {
            calories: 55,
            protein: 3.7,
            carbs: 11,
            fats: 0.6,
            serving_size: '1 cup',
          }
        },
        {
          name: "A Glass of Water",
          confidence: 0.75,
          nutrition: null // This item should be ignored by the frontend.
        }
      ]
    }

    return new Response(JSON.stringify(mockRecognitionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})