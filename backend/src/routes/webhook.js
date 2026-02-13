import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { securityLogger } from "../lib/security-logger.js";

const router = Router();

// POST /api/webhooks/paypal - Handle PayPal subscription events
router.post("/paypal", async (req, res) => {
    try {
        const event = req.body;
        const eventType = event?.event_type;

        console.log(`[PayPal Webhook] Received event: ${eventType}`);

        // TODO: In production, verify PayPal webhook signature
        // https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
        // For now, log a warning
        if (process.env.NODE_ENV === "production" && !process.env.PAYPAL_WEBHOOK_ID) {
            console.warn("[PayPal Webhook] WARNING: PAYPAL_WEBHOOK_ID not set — webhook signature not verified!");
        }

        const resource = event?.resource;
        const subscriptionId = resource?.id;

        if (!subscriptionId) {
            console.warn("[PayPal Webhook] No subscription ID in event");
            return res.status(200).json({ received: true }); // Always return 200 to PayPal
        }

        switch (eventType) {
            case "BILLING.SUBSCRIPTION.ACTIVATED": {
                // Find user by subscriptionId and activate their plan
                const user = await prisma.user.findFirst({
                    where: { subscriptionId },
                });

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { subscriptionStatus: "active" },
                    });
                    console.log(`[PayPal Webhook] Subscription ${subscriptionId} activated for user ${user.email}`);
                } else {
                    console.warn(`[PayPal Webhook] No user found for subscription ${subscriptionId}`);
                }
                break;
            }

            case "BILLING.SUBSCRIPTION.CANCELLED": {
                const user = await prisma.user.findFirst({
                    where: { subscriptionId },
                });

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            plan: "free",
                            subscriptionStatus: "cancelled",
                        },
                    });
                    console.log(`[PayPal Webhook] Subscription ${subscriptionId} cancelled for user ${user.email}`);
                    securityLogger.info?.(`Subscription cancelled for ${user.email}`);
                }
                break;
            }

            case "BILLING.SUBSCRIPTION.SUSPENDED": {
                const user = await prisma.user.findFirst({
                    where: { subscriptionId },
                });

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            plan: "free",
                            subscriptionStatus: "suspended",
                        },
                    });
                    console.log(`[PayPal Webhook] Subscription ${subscriptionId} suspended for user ${user.email}`);
                }
                break;
            }

            case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
                const user = await prisma.user.findFirst({
                    where: { subscriptionId },
                });

                if (user) {
                    console.warn(`[PayPal Webhook] Payment failed for subscription ${subscriptionId} (user: ${user.email})`);
                    // Don't immediately downgrade — PayPal will retry and eventually cancel
                }
                break;
            }

            default:
                console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
        }

        // Always return 200 to PayPal to acknowledge receipt
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("[PayPal Webhook] Error processing webhook:", error);
        // Still return 200 to prevent PayPal from retrying
        return res.status(200).json({ received: true });
    }
});

export default router;
