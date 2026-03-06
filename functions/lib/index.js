"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const stripe_1 = require("stripe");
const stripeSecretKey = (0, params_1.defineSecret)('STRIPE_SECRET_KEY');
exports.createPaymentIntent = (0, https_1.onRequest)({ secrets: [stripeSecretKey] }, async (req, res) => {
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
        const stripe = new stripe_1.default(key, { apiVersion: '2025-02-24.acacia' });
        const { items } = req.body;
        const total = items.reduce((sum, item) => sum + item.price, 0);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.status(200).send({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        console.error('Stripe error:', error);
        res.status(400).send({ error: { message: error.message } });
    }
});
//# sourceMappingURL=index.js.map