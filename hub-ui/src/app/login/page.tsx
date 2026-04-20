"use client";

import { useActionState, useEffect, Suspense } from "react";
import { useFormStatus } from "react-dom";
import { authenticate, State } from "./actions";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Import sonner's toast
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/videos";
  const [state, formAction] = useActionState<State, FormData>(authenticate, {});
  // Removed displayError state as sonner will be used for error display

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error); // Directly use toast.error to display the error
      console.error(`[Auth Tracking] Client received error: ${state.error}`);
      // Sonner automatically handles display duration and dismissal, no manual timer needed
    }
  }, [state]);

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <form action={formAction} className="bg-card text-card-foreground border border-border p-8 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {/* Removed Alert component rendering */}
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <div className="mb-4">
          <Label htmlFor="email" className="mb-2">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email"
            required
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="password" className="mb-2">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="password"
          />
        </div>
        <LoginButton />
      </form>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      type="submit"
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}
