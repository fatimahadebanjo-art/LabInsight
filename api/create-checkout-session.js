import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const { priceId, uid } = req.body;

    // Detect the origin dynamically (works for production + preview branches)
    const origin = req.headers.origin || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/upgrade.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro.html`,
      metadata: { uid }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe session creation failed:", err);
    res.status(500).json({ error: err.message });
  }
}
