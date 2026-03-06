import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');

export const createPaymentIntent = onRequest(
    { secrets: [stripeSecretKey], cors: true },
    async (req: any, res: any) => {
        res.set('Access-Control-Allow-Origin', '*');

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.status(204).send('');
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).send({ error: 'Method Not Allowed' });
            return;
        }

        try {
            const key = stripeSecretKey.value();
            if (!key) {
                res.status(500).send({ error: { message: 'Stripe key not configured' } });
                return;
            }

            const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });

            const { items } = req.body;
            const total = items.reduce((sum: number, item: any) => sum + item.price, 0);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(total * 100),
                currency: 'usd',
                automatic_payment_methods: { enabled: true },
            });

            res.status(200).send({ clientSecret: paymentIntent.client_secret });
        } catch (error: any) {
            console.error('Stripe error:', error);
            res.status(400).send({ error: { message: error.message } });
        }
    }
);
