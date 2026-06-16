"use server";

import { signIn } from "../../auth";
import { AuthError } from "next-auth";

export type State = {
  error?: string;
};

export async function authenticate(prevState: State | undefined, formData: FormData): Promise<State> {
  const email = formData.get("email")?.toString() || "unknown";
  console.info(`[Auth Tracking] Action: Attempting to authenticate user: ${email}`);
  const startTime = performance.now();

  try {
    await signIn("credentials", formData);
    console.info(`[Auth Tracking] Authentication successful for ${email} in ${(performance.now() - startTime).toFixed(0)}ms. Redirecting...`);
    return {};
  } catch (error) {
    // The `signIn` function throws a `NEXT_REDIRECT` error when the login is successful.
    // We need to catch this error and re-throw it to allow Next.js to handle the redirect.
    if ((error as Error).message.includes("NEXT_REDIRECT")) {
      console.info(`[Auth Tracking] Authentication successful for ${email} in ${(performance.now() - startTime).toFixed(0)}ms. Redirecting...`);
      throw error;
    }
    console.error(`[Auth Tracking] Authentication failed for ${email} in ${(performance.now() - startTime).toFixed(0)}ms:`, error);
    if (error instanceof AuthError) {
      console.warn(`[Auth Tracking] AuthError type: ${error.type}`);
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password." };
      } else if (error.type === "CallbackRouteError") {
        // This can happen if the user is redirected from the provider, but there's an error during the callback.
        // We can treat it as a generic error for now.
        return { error: "An error occurred during login." };
      } else {
        return { error: `An AuthError occurred: ${error.type}` };
      }
    }
    return { error: "An unknown error occurred." };
  }
}
