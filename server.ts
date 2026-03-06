import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { items } = req.body;

      // Calculate total on server to prevent tampering
      const total = items.reduce((sum: number, item: any) => sum + item.price, 0);

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(400).send({ error: { message: error.message } });
    }
  });

  // --- Image Matcher API ---
  app.get("/api/unmapped-images", (req, res) => {
    const fs = require('fs');
    try {
      const files = fs.readdirSync('./public/images').filter((f: string) =>
        f.match(/\.(jpg|jpeg|png|webp)$/i)
      );
      res.json(files);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/match-image", (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const { rawName, correctName } = req.body;
    try {
      const oldPath = path.join(__dirname, 'public', 'images', rawName);
      const newPath = path.join(__dirname, 'public', 'images', correctName);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
