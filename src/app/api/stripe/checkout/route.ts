
import { auth } from '@clerk/nextjs/server';
import { db } from "@/db";
import { campaigns, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export async function POST(req: Request) {
    try {
        if (!stripe) {
            console.error("Stripe Error: Missing STRIPE_SECRET_KEY");
            return new NextResponse("Stripe configuration missing. Set STRIPE_SECRET_KEY in .env", { status: 500 });
        }

        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { campaignId, campaignName, amount } = await req.json();

        if (!campaignId || !amount) {
            return new NextResponse("Missing campaignId or amount", { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Ad Campaign: ${campaignName}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/ads?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/ads?canceled=true`,
            metadata: {
                campaignId: campaignId,
            },
            automatic_tax: { enabled: true },
            tax_id_collection: { enabled: true },
            billing_address_collection: 'auto',
        });

        // Record pending transaction
        await db.insert(transactions).values({
            userId,
            campaignId,
            amount: Math.round(amount * 100),
            currency: 'usd',
            status: 'pending',
            method: 'stripe',
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Error:", error);
        return new NextResponse(error.message || "Internal Stripe Error", { status: 500 });
    }
}
