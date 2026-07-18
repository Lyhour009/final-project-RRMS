"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setChecking(false);
      if (!data.user) setError("This recovery link is invalid or has expired.");
    });
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Password must contain at least 8 characters.");
    if (password !== confirmation) return setError("Passwords do not match.");

    setPending(true);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) return setError(updateError.message);
    await supabase.auth.signOut();
    router.replace("/login?password=updated");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500"><KeyRound /></div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">Create a new password</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use at least 8 characters and do not reuse an old password.</p>

        {checking ? <Loader2 className="mx-auto mt-8 animate-spin text-indigo-500" /> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
            {error && <p aria-live="polite" className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={pending || Boolean(error.includes("expired"))} className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update password
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
