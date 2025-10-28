import { pricingPlans } from "@/utils/constants";
import { getDbConnection } from "./db";
import { getUserDocumentCount } from "./summaries";

export async function getPriceIdForActiveUser(email: string) {
  const sql = await getDbConnection();

  const query =
    await sql`SELECT price_id FROM users WHERE email = ${email} AND status = 'active'`;

  return query?.[0]?.price_id || null;
}

export async function getPriceIdForUser(email: string) {
  const sql = await getDbConnection();

  const query = await sql`SELECT price_id FROM users WHERE email = ${email}`;

  return query?.[0]?.price_id || null;
}

export async function createUserInDatabase({
  email,
  fullName,
  status = "inactive",
}: {
  email: string;
  fullName?: string;
  status?: string;
}) {
  try {
    const sql = await getDbConnection();

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existingUser.length > 0) {
      console.log("User already exists:", existingUser[0]);
      return { user: existingUser[0], isNew: false };
    }

    const newUser = await sql`
      INSERT INTO users (email, full_name, status) 
      VALUES (${email}, ${fullName || ""}, ${status}) 
      RETURNING *
    `;

    console.log("New user created:", newUser[0]);
    return { user: newUser[0], isNew: true };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const sql = await getDbConnection();
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;
    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function hasReachedUploadLimit(userId: string, email: string) {
  const uploadCount = await getUserDocumentCount(userId);

  const priceId = await getPriceIdForActiveUser(email);

  const isPro = pricingPlans.find((plan) => plan.priceId === priceId)?.id === "pro";

  const uploadLimit: number = isPro ? 1000 : 5;
  
  return {hasReachedLimit: uploadCount >= uploadLimit, uploadLimit};
}
