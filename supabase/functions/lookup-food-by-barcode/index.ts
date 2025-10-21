import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { barcode } = await req.json()
    if (!barcode) {
      return new Response(JSON.stringify({ error: 'Barcode is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
    if (!response.ok) {
      throw new Error(`Open Food Facts API request failed with status ${response.status}`)
    }
    
    const data = await response.json()

    if (data.status === 0 || !data.product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const product = data.product
    const nutriments = product.nutriments

    const foodData = {
      name: product.product_name || 'Unknown Food',
      calories: nutriments['energy-kcal_100g'] || 0,
      protein: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
      fats: nutriments.fat_100g || 0,
      serving_size: product.serving_size || '100g',
    }

    return new Response(JSON.stringify(foodData), {
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