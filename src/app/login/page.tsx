"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Building2, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

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

const loginSchema = z.object({
  email: z.string().email("សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ"),
  password: z.string().min(6, "លេខកូដសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    reset({ email: "", password: "" });
    setMounted(true);
  }, [reset]);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        toast.error("អ៊ីមែល ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ");
        return;
      }

      if (!authData.user) {
        toast.error("រកមិនឃើញអ្នកប្រើប្រាស់ទេ");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        toast.error("រកមិនឃើញព័ត៌មានគណនីអ្នកប្រើប្រាស់");
        return;
      }

      if (!profile.role) {
        toast.error("គណនីនេះមិនទាន់មានតួនាទីទេ");
        return;
      }

      toast.success("បានចូលប្រើប្រាស់ជោគជ័យ!");

      if (profile.role === "admin") {
        router.push("/admin/dashboard");
      } else if (profile.role === "tenant") {
        router.push("/tenant/dashboard");
      } else {
        toast.error("តួនាទីគណនីមិនត្រឹមត្រូវ");
      }

      router.refresh();
    } catch {
      toast.error("មានបញ្ហាបច្ចេកទេសកើតឡើង សូមព្យាយាមម្ដងទៀត");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-sm relative">
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
            <form
              onSubmit={handleSubmit(onLoginSubmit)}
              autoComplete="off"
              className="space-y-4"
            >
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
                  autoComplete="username"
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

                  {/* <button
                    type="button"
                    className="text-[12px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button> */}
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`h-9 pr-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 ${
                      errors.password
                        ? "border-rose-500 focus-visible:ring-rose-500"
                        : ""
                    }`}
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !mounted}
                className="w-full h-9 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    <span lang="km">កំពុងផ្ទៀងផ្ទាត់...</span>
                  </>
                ) : (
                  <span lang="km">ចូលប្រើប្រាស់ប្រព័ន្ធ</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-300 dark:text-slate-500 mt-5">
          © {new Date().getFullYear()} RRMS. រក្សាសិទ្ធិគ្រប់យ៉ាង (All rights
          reserved).
        </p>
      </div>
    </div>
  );
}
