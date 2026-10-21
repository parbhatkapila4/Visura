import Razorpay from "razorpay";
import crypto from "crypto";

export const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const digest = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  const expected = Buffer.from(digest);
  const given = Buffer.from(String(params.signature));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
