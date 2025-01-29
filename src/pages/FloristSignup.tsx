import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";

export default function FloristSignup() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(searchParams.get("name") || "");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName, "florist");
      // After successful signup, redirect to store setup
      navigate("/become-florist");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Create Florist Account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="mt-1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="email">
                  Business Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your business email"
                  className="mt-1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  minLength={6}
                  className="mt-1"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Continue to Store Setup"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
                disabled={loading}
              >
                Login
              </button>
            </p>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Want to buy flowers?{" "}
                <button
                  onClick={() => navigate("/customer-signup")}
                  className="text-primary hover:underline font-medium"
                  disabled={loading}
                >
                  Create a customer account
                </button>
              </p>
            </div>
          </Card>
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-800 mb-2">
              Getting Started as a Florist
            </h2>
            <p className="text-sm text-blue-700">
              After creating your account, you'll be able to:
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>Set up your store profile and branding</li>
              <li>Configure delivery zones and pricing</li>
              <li>Add your product catalog</li>
              <li>Manage orders and inventory</li>
            </ul>
            <p className="mt-2 text-sm text-blue-700">
              Your store will remain in draft mode until you're ready to submit for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}