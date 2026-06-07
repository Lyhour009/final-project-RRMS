"use client";

import { useEffect } from "react"; // 👈 Added for handling component mount triggers
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Building2, Loader2, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ── Validation ────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .email("សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ (Enter a valid email)"),
  password: z
    .string()
    .min(
      6,
      "លិខិតឆ្លងដែនត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់ (Password must be at least 6 characters)",
    ),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset, // 👈 Destructured reset function from react-hook-form
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 👈 Force-clears form values on fresh load/redirect mount
  useEffect(() => {
    reset({ email: "", password: "" });
  }, [reset]);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        toast.error("ការចូលប្រើប្រាស់បរាជ័យ ");
        return;
      }

      toast.success("បានចូលប្រើប្រាស់ជោគជ័យ!");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        router.push("/login");
        return;
      }

      router.push(
        profile.role === "admin" ? "/admin/dashboard" : "/tenant/overview",
      );
      router.refresh();
    } catch {
      toast.error("មានបញ្ហាបច្ចេកទេសកើតឡើង (Unexpected Error)");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-sm relative">
        {/* ── Brand mark ── */}
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              RRMS
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-0.5">
              Room Rental Management System
            </p>
          </div>
        </div>

        {/* ── Card ── */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-none">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
              ចូលប្រើប្រាស់គណនី
            </CardTitle>
            <CardDescription
              lang="km"
              className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed"
            >
              សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីគ្រប់គ្រងប្រព័ន្ធផ្ទះជួល
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Added autoComplete="off" to the outer form block wrapper */}
            <form
              onSubmit={handleSubmit(onLoginSubmit)}
              autoComplete="off"
              className="space-y-4"
            >
              {/* ── Email ── */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[13px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  អ៊ីមែល{" "}
                  <span className="text-slate-400 font-normal">
                    (Email Address)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="off" // 👈 Changed from "email" to stop browser auto-injection
                  className={`h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 ${
                    errors.email
                      ? "border-rose-500 focus-visible:ring-rose-500"
                      : ""
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* ── Password ── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-[13px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    លេខកូដសម្ងាត់{" "}
                    <span className="text-slate-400 font-normal">
                      (Password)
                    </span>
                  </Label>
                  <button
                    type="button"
                    className="text-[12px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password" // 👈 Prevents the browser password chain auto-populating on logouts
                  className={`h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 ${
                    errors.password
                      ? "border-rose-500 focus-visible:ring-rose-500"
                      : ""
                  }`}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* ── Submit ── */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    <span lang="km">កំពុងផ្ទៀងផ្ទាត់...</span>
                  </>
                ) : (
                  <span lang="km">ចូលប្រើប្រាស់ប្រព័ន្ធ </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-[11px] text-slate-300 dark:text-slate-500 mt-5">
          © {new Date().getFullYear()} RRMS. រក្សាសិទ្ធិគ្រប់យ៉ាង (All rights
          reserved).
        </p>
      </div>
    </div>
  );
}
