import { documentLimitFor, getPlanForEmail } from "./billing";
import { getDbConnection } from "./db";
import { getUserDocumentCount } from "./summaries";

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
  const [uploadCount, plan] = await Promise.all([
    getUserDocumentCount(userId),
    getPlanForEmail(email),
  ]);
  const uploadLimit = documentLimitFor(plan);

  return { hasReachedLimit: uploadCount >= uploadLimit, uploadLimit, plan };
}
