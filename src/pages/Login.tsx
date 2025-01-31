import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { Card } from "../components/ui/card";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes("Invalid login credentials")) {
            return "Invalid email or password. Please check your credentials and try again.";
          }
          break;
        case 422:
          return "Invalid email format. Please enter a valid email address.";
        case 429:
          return "Too many login attempts. Please try again later.";
      }
    }
    return "An error occurred during login. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E3DD]">
      <div className="container mx-auto px-4 pt-24">
        <Card className="max-w-md mx-auto p-8 bg-white/95 shadow-lg rounded-xl">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#4A4F41]">Welcome Back</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4A4F41]/80 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={loading}
                className="bg-white border-[#4A4F41]/10 focus:border-[#4A4F41]/30"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4A4F41]/80 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={loading}
                className="bg-white border-[#4A4F41]/10 focus:border-[#4A4F41]/30"
              />
            </div>
            <Button type="submit" className="w-full bg-[#4A4F41] text-white hover:bg-[#4A4F41]/90" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-[#4A4F41]/70">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#4A4F41] hover:text-[#4A4F41]/80 font-medium">
                Sign up
              </Link>
            </p>
            <p className="mt-2">
              Are you a florist?{" "}
              <Link to="/florist-signup" className="text-[#4A4F41] hover:text-[#4A4F41]/80 font-medium">
                Join as a florist
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;