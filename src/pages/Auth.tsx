import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { Flame, ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps { redirectAfterAuth?: string; }

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/home") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const returnTo = searchParams.get("returnTo");
  const redirect = resolveRedirectAfterAuth(returnTo, tableId ? `/home?tableId=${tableId}` : redirectAfterAuth);

  const [authStep, setAuthStep] = useState<"signIn" | "otp">("signIn");
  const [emailValue, setEmailValue] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect);
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const authFormData = new FormData();
      authFormData.set("email", email);
      await signIn("email-otp", authFormData);
      setEmailValue(email);
      setAuthStep("otp");
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", emailValue);
      formData.set("code", otp);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch {
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <Flame className="h-5 w-5 text-primary mr-1" />
          <span className="font-bold">MYOP</span>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="min-w-[360px] max-w-[420px] pb-0 border shadow-lg">
          {authStep === "signIn" ? (
            <>
              <CardHeader className="text-center pt-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Flame className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">Welcome to MYOP</CardTitle>
                <CardDescription>
                  Enter your email to receive a verification code
                </CardDescription>
                {tableId && (
                  <div className="mt-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary inline-flex items-center gap-1 mx-auto">
                    🔥 Table will be auto-detected
                  </div>
                )}
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input name="email" placeholder="you@example.com" type="email" className="pl-9" disabled={isLoading} required />
                    </div>
                    <Button type="submit" variant="outline" size="icon" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                  {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
                  <div className="mt-4 space-y-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">How it works</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span>We'll send a 6-digit code to your email</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>Dine-in only — scan your table QR code to order</span>
                    </div>
                  </div>
                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center pt-8">
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                  We sent a 6-digit code to <span className="font-medium text-foreground">{emailValue}</span>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={emailValue} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Didn't receive a code?{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setAuthStep("signIn")}>
                      Try a different email
                    </Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button type="submit" className="w-full fire-gradient text-white" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>) : (<>Verify & Start Ordering<ArrowRight className="ml-2 h-4 w-4" /></>)}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setAuthStep("signIn")} disabled={isLoading} className="w-full">
                    Use different email
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
          <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
            Dine-in only • Wood-fired pizzas • Make your own
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return <Suspense><Auth {...props} /></Suspense>;
}
