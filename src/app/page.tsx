"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/field";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import type { AppUser, Role } from "@/lib/types";

export default function LoginPage() {
  const { state, login, setLang } = useAppStore();
  const router = useRouter();
  const [role, setRole] = useState<Role>("farmer");
  const [id, setId] = useState("9876543210");
  const [password, setPassword] = useState("1234");
  const [otpMode, setOtpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [register, setRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerVillage, setRegisterVillage] = useState("Sanand");
  const lang = state.lang;

  async function go(nextRole: Role) {
    setLoading(true);
    try {
      const result = await api.post<{ user: AppUser }>("/login.php", {
        email: id,
        password,
        role: nextRole,
      });
      login(result.user.role, result.user.name, result.user.email, result.user.farmerId);
      toast.success(`Welcome, ${result.user.name}`);
      router.push(nextRole === "farmer" ? "/farmer" : "/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[var(--heading)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg, transparent 0 18px, rgba(255,255,255,.06) 18px 19px)",
          }}
        />
        <Logo light />
        <div className="relative max-w-md">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#b7d8c4]">PROCUREMENT SUPPORT</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight">FARM FLOW</h1>
          <p className="mt-4 text-xl text-[#d5eadc]">{t(lang, "tagline")}</p>
          <p className="mt-6 text-lg leading-relaxed text-[#cfe0d6]">{t(lang, "loginExplain")}</p>
          <ol className="mt-10 space-y-2 text-sm text-[#d5eadc]">
            {["Harvest", "Book slot", "Arrive", "Graded", "Paid"].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <p className="relative text-sm text-[#9cb8a8]">Farmers should not have to wait just to find out what is happening.</p>
      </section>
      <section className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mb-8 lg:hidden">
          <Logo />
          <p className="mt-2 text-[var(--heading)]">{t(lang, "tagline")}</p>
        </div>
        <div className="mb-4 flex justify-end">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className="h-10 rounded-xl border border-[var(--line)] bg-white px-2 text-sm font-semibold"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </div>
        <Card className="mx-auto w-full max-w-md p-6">
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Sign in</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(["farmer", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`h-12 rounded-xl border text-sm font-bold ${
                  role === r ? "border-[var(--primary)] bg-[var(--sage)] text-[var(--heading)]" : "border-[var(--line)]"
                }`}
              >
                {t(lang, r)}
              </button>
            ))}
          </div>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!id || !password) {
                toast.error("Enter your email and password");
                return;
              }
              go(role);
            }}
          >
            <div>
              <Label htmlFor="id">Email</Label>
              <Input id="id" type="email" value={id} onChange={(e) => setId(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="pw">{otpMode ? "OTP" : "Password"}</Label>
              <Input
                id="pw"
                type={otpMode ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in…" : t(lang, "login")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setOtpMode(true);
                setPassword("4821");
                toast.message("OTP sent to your mobile (demo: 4821)");
              }}
            >
              {t(lang, "loginOtp")}
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm font-semibold text-[var(--primary)]">
            <button onClick={() => setForgot(true)}>{t(lang, "forgot")}</button>
            <button onClick={() => setRegister(true)}>{t(lang, "register")}</button>
          </div>
          <Link href="/government-signup" className="mt-5 block text-center text-sm font-semibold text-[var(--heading)] underline">
            Government center admin signup
          </Link>
        </Card>
      </section>
      <Dialog open={forgot} onClose={() => setForgot(false)} title="Reset password">
        <p className="text-[#5c6f68]">We will send a reset code to your registered mobile. For this demo, use password 1234.</p>
        <Button className="mt-4 w-full" onClick={() => { toast.success("Reset code sent (demo)"); setForgot(false); }}>
          Send code
        </Button>
      </Dialog>
      <Dialog open={register} onClose={() => setRegister(false)} title="Farmer registration">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              try {
                const result = await api.post<{ user: AppUser }>("/register.php", {
                  name: registerName,
                  email: registerEmail,
                  password: registerPassword,
                  role: "farmer",
                  mobile: registerMobile,
                  village: registerVillage,
                });
                login(result.user.role, result.user.name, result.user.email, result.user.farmerId);
                toast.success("Account created");
                setRegister(false);
                router.push("/farmer");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to create account");
              }
            })();
          }}
        >
          <div>
            <Label>Full name</Label>
            <Input required value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input required type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input required type="password" minLength={6} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
          </div>
          <div>
            <Label>Mobile</Label>
            <Input required value={registerMobile} onChange={(e) => setRegisterMobile(e.target.value)} />
          </div>
          <div>
            <Label>Village</Label>
            <Select value={registerVillage} onChange={(e) => setRegisterVillage(e.target.value)}>
              <option>Sanand</option>
              <option>Kalol</option>
              <option>Dholka</option>
            </Select>
          </div>
          <Button className="w-full" type="submit">Create account</Button>
        </form>
      </Dialog>
    </div>
  );
}
