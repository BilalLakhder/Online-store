// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events for payment confirmation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        // Extract metadata
        const { customerEmail, lineItems, subtotal, discount, tax, shipping, promoCode } = paymentIntent.metadata;
        
        // Parse line items
        let items = [];
        try {
          const parsedItems = JSON.parse(lineItems || '[]');
          
          // Fetch full product details for the order
          const productIds = parsedItems.map((item: { id: string }) => item.id);
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price, image_url, is_sale, sale_price')
            .in('id', productIds);

          items = parsedItems.map((item: { id: string; qty: number; price: number }) => {
            const product = products?.find(p => p.id === item.id);
            return {
              id: item.id,
              name: product?.name || 'Unknown Product',
              price: item.price,
              quantity: item.qty,
              imageUrl: product?.image_url || '',
              isSale: product?.is_sale || false,
              salePrice: product?.sale_price,
            };
          });
        } catch (e) {
          console.error('Failed to parse line items:', e);
        }

        // Create order in database
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_email: customerEmail,
            customer_name: paymentIntent.receipt_email || customerEmail,
            total: paymentIntent.amount / 100, // Convert from cents
            status: 'processing',
            items,
            payment_intent_id: paymentIntent.id,
            payment_status: 'paid',
            shipping_address: '', // Would come from Stripe shipping if configured
          })
          .select()
          .single();

        if (orderError) {
          console.error('Failed to create order:', orderError);
        } else {
          console.log('Order created:', order.id);

          // Update product inventory
          for (const item of items) {
            await supabase.rpc('decrement_inventory', {
              product_id: item.id,
              quantity: item.quantity
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        
        // You could notify the customer or log for support
        const { customerEmail } = paymentIntent.metadata;
        console.log(`Payment failed for ${customerEmail}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);
        
        // Update order status if you track payment_intent_id
        if (charge.payment_intent) {
          await supabase
            .from('orders')
            .update({ status: 'refunded', payment_status: 'refunded' })
            .eq('payment_intent_id', charge.payment_intent);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
