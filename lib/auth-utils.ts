import { currentUser } from "@clerk/nextjs/server";
import { createUserInDatabase, getUserByEmail } from "./user";

export async function ensureUserExistsInDatabase() {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.error("No email found for user");
      return null;
    }

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      console.log("User not found in database, creating...");
      const result = await createUserInDatabase({
        email,
        fullName: user.fullName || undefined,
        status: "inactive",
      });
      console.log("User created in database successfully");
      return result.user;
    } else {
      console.log("User already exists in database:", existingUser.email);
      return existingUser;
    }
  } catch (error) {
    console.error("Error ensuring user exists in database:", error);
    return null;
  }
}
