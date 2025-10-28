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
import { Loader2, AlertCircle, Mail, MessageCircle } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginDialog = ({
  open,
  onOpenChange,
  onSwitchToSignup,
  onSwitchToForgotPassword,
}: LoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signInWithGoogle } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn(data.email, data.password);
      onOpenChange(false);
      form.reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Welcome Back</DialogTitle>
          <DialogDescription className="text-slate-400">
            Sign in to your YOLOSEUM account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-slate-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full border-slate-700 hover:bg-slate-800 hover:text-amber-500 text-slate-300"
          >
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="w-full border-slate-700 hover:bg-slate-800 hover:text-amber-500 text-slate-300"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Discord
          </Button>

          <div className="text-center space-y-2 pt-2">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToSignup();
                }}
                className="text-amber-500 hover:text-amber-400 font-medium"
              >
                Sign up
              </button>
            </p>
            <p className="text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToForgotPassword();
                }}
                className="text-amber-500 hover:text-amber-400"
              >
                Forgot your password?
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
