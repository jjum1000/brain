import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Mail, MessageCircle } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInClick?: () => void;
}

export const SignupDialog = ({
  open,
  onOpenChange,
  onSignInClick,
}: SignupDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    if (!agreedToTerms) {
      setError("You must agree to the terms of service");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await signUp(data.email, data.password, data.displayName);
      onOpenChange(false);
      form.reset();
      setAgreedToTerms(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!agreedToTerms) {
      setError("You must agree to the terms of service");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      onOpenChange(false);
      setAgreedToTerms(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up with Google";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Create Account</DialogTitle>
          <DialogDescription className="text-slate-400">
            Join YOLOSEUM and start trading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <Alert variant="destructive" className="border-red-800 bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400 ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your trading name"
                        disabled={isLoading}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        disabled={isLoading}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                    <p className="text-xs text-slate-400 mt-1">
                      At least 8 characters, 1 uppercase, 1 lowercase, 1 number
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked === true)
                  }
                  disabled={isLoading}
                  className="border-slate-600"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  I agree to the{" "}
                  <a href="#" className="text-amber-500 hover:text-amber-400">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-amber-500 hover:text-amber-400">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-slate-400">Or sign up with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading || !agreedToTerms}
            onClick={handleGoogleSignUp}
            className="w-full border-slate-700 hover:bg-slate-800 hover:text-amber-500 text-slate-300"
          >
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading || !agreedToTerms}
            className="w-full border-slate-700 hover:bg-slate-800 hover:text-amber-500 text-slate-300"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Discord
          </Button>

          <div className="text-center text-sm text-slate-400 pt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSignInClick?.();
              }}
              className="text-amber-500 hover:text-amber-400 font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
