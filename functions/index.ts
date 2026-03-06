import * as functions from 'firebase-functions';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-02-24.acacia' as any
});

export const createPaymentIntent = functions.https.onRequest(async (req, res) => {
    // CORS configuration
    res.set('Access-Control-Allow-Origin', '*'); // Or restrict to your specific domain

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { items } = req.body;

        // Calculate total
        const total = items.reduce((sum: number, item: any) => sum + item.price, 0);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error("Stripe error:", error);
        res.status(400).send({ error: { message: error.message } });
    }
});
