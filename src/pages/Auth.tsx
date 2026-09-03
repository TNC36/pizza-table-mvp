import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { Flame, ArrowRight, Loader2, Phone } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/home",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const returnTo = searchParams.get("returnTo");
  const redirect = resolveRedirectAfterAuth(
    returnTo,
    tableId ? `/home?tableId=${tableId}` : redirectAfterAuth,
  );

  const [step, setStep] = useState<"signIn" | { phone: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handlePhoneSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const phone = formData.get("phone") as string;
      // Use phone number as the email identifier for Convex Auth
      const phoneAsEmail = `${phone.replace(/\D/g, "")}@phone.myopizza.com`;
      const authFormData = new FormData();
      authFormData.set("email", phoneAsEmail);
      await signIn("email-otp", authFormData);
      setStep({ phone });
      setIsLoading(false);
    } catch (error) {
      console.error("Phone sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const phoneAsEmail = `${step.phone.replace(/\D/g, "")}@phone.myopizza.com`;
      const formData = new FormData();
      formData.set("email", phoneAsEmail);
      formData.set("code", otp);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <Flame className="h-5 w-5 text-primary mr-1" />
          <span className="font-bold">MYOP</span>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[360px] max-w-[420px] pb-0 border shadow-lg">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center pt-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Flame className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Welcome to MYOP</CardTitle>
                  <CardDescription>
                    Enter your phone number to start ordering
                  </CardDescription>
                  {tableId && (
                    <div className="mt-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary inline-flex items-center gap-1 mx-auto">
                      🔥 Table will be auto-detected
                    </div>
                  )}
                </CardHeader>
                <form onSubmit={handlePhoneSubmit}>
                  <CardContent>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="phone"
                          placeholder="+91 98765 43210"
                          type="tel"
                          className="pl-9"
                          disabled={isLoading}
                          required
                          pattern="[\+]?[0-9\s\-]{10,15}"
                          title="Enter a valid phone number"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-destructive">{error}</p>
                    )}
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center pt-8">
                  <CardTitle>Check your phone</CardTitle>
                  <CardDescription>
                    We sent a verification code to {step.phone}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4">
                    <input type="hidden" name="email" value={`${step.phone.replace(/\D/g, "")}@phone.myopizza.com`} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                            const form = (e.target as HTMLElement).closest("form");
                            if (form) form.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-destructive text-center">
                        {error}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Didn't receive a code?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setStep("signIn")}
                      >
                        Try again
                      </Button>
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full fire-gradient text-white"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Start Ordering
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Use different phone number
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
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
