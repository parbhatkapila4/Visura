import Stripe from "stripe";
import { getDbConnection } from "./db";

export async function handleSubscriptionDeleted({
  subscriptionId,
  stripe,
}: {
  subscriptionId: string;
  stripe: Stripe;
}) {
  console.log("Subscription deleted", subscriptionId);

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const sql = await getDbConnection();

    await sql`UPDATE users SET status = 'cancelled' WHERE customer_id = ${subscription.customer}`;

    console.log("Subscription cancelled", subscription);
  } catch (error) {
    console.error("Error deleting subscription", error);
    throw error;
  }
}

export async function handleCheckoutSessionCompleted({
  session,
  stripe,
}: {
  session: Stripe.Checkout.Session;
  stripe: Stripe;
}) {
  console.log("Checkout session completed", session);

  try {
    const customerId = session.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    console.log("Customer:", customer);
    console.log("Price ID:", priceId);
    console.log("Line items:", lineItems.data);

    if ("email" in customer && priceId) {
      const { email, name } = customer;

      const sql = await getDbConnection();

      await CreateOrUpdateUser({
        sql,
        email: email as string,
        fullName: name as string,
        customerId,
        priceId: priceId as string,
        status: "active",
      });

      await createPayment({
        sql,
        session,
        priceId: priceId as string,
        userEmail: email as string,
      });

      console.log("User created/updated successfully for email:", email);
    } else {
      console.error("Missing email or priceId:", {
        email: "email" in customer ? customer.email : "not found",
        priceId,
      });
    }
  } catch (error) {
    console.error("Error in handleCheckoutSessionCompleted:", error);
    throw error;
  }
}

async function CreateOrUpdateUser({
  sql,
  email,
  fullName,
  customerId,
  priceId,
  status,
}: {
  sql: any;
  email: string;
  fullName: string;
  customerId: string;
  priceId: string;
  status: string;
}) {
  try {
    console.log("Creating/updating user with data:", {
      email,
      fullName,
      customerId,
      priceId,
      status,
    });

    const user = await sql`SELECT * FROM users WHERE email = ${email}`;
    console.log("Existing user found:", user);

    if (user.length === 0) {
      console.log("Creating new user...");
      const result =
        await sql`INSERT INTO users (email, full_name, customer_id, price_id, status) VALUES (${email}, ${fullName}, ${customerId}, ${priceId}, ${status}) RETURNING *`;
      console.log("New user created:", result);
    } else {
      console.log("Updating existing user...");
      const result =
        await sql`UPDATE users SET customer_id = ${customerId}, price_id = ${priceId}, status = ${status}, full_name = ${fullName} WHERE email = ${email} RETURNING *`;
      console.log("User updated:", result);
    }
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw error;
  }
}

async function createPayment({
  sql,
  session,
  priceId,
  userEmail,
}: {
  sql: any;
  session: Stripe.Checkout.Session;
  priceId: string;
  userEmail: string;
}) {
  try {
    const { amount_total, id, status } = session;

    console.log("Creating payment record:", {
      amount_total,
      id,
      status,
      priceId,
      userEmail,
    });

    const result =
      await sql`INSERT INTO payments (amount, status, stripe_payment_id, price_id, user_email) VALUES (${amount_total}, ${status}, ${id}, ${priceId}, ${userEmail}) RETURNING *`;
    console.log("Payment record created:", result);
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}
