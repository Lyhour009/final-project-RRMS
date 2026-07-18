"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setPending(false);
    if (recoveryError) {
      setError("Unable to send the recovery email. Please try again later.");
      return;
    }
    setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Mail /></div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Enter your account email and we will send a secure recovery link.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            If an account exists for that email, a recovery link has been sent. Check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="recovery-email">Email</Label>
              <Input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            {error && <p aria-live="polite" className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send recovery link
            </Button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-500">
          <ArrowLeft size={15} /> Back to login
        </Link>
      </section>
    </main>
  );
}
