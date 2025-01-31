import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    user_type: "buyer" // or 'seller'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password length
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      console.log('Attempting signup with:', {
        email: formData.email,
        password: '***',
        options: {
          data: {
            full_name: formData.full_name,
            user_type: formData.user_type
          }
        }
      });

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            user_type: formData.user_type
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success('Account created! Please check your email to confirm your account.');
        if (formData.user_type === 'seller') {
          navigate('/become-florist');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E3DD]">
      <div className="container mx-auto px-4 pt-24">
        <Card className="max-w-md mx-auto p-8 bg-white/95 shadow-lg rounded-xl">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#4A4F41]">Create an Account</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-[#4A4F41]/80">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-white border-[#4A4F41]/10 focus:border-[#4A4F41]/30"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#4A4F41]/80">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-[#4A4F41]/10 focus:border-[#4A4F41]/30"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#4A4F41]/80">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white border-[#4A4F41]/10 focus:border-[#4A4F41]/30"
                placeholder="Create a password"
              />
              <p className="text-sm text-[#4A4F41]/60">Must be at least 6 characters long</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[#4A4F41]/80">I want to</Label>
              <RadioGroup
                value={formData.user_type}
                onValueChange={(value) => setFormData({ ...formData, user_type: value })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buyer" id="buyer" className="border-[#4A4F41]/20 text-[#4A4F41]" />
                  <Label htmlFor="buyer" className="text-[#4A4F41]/80">Buy Flowers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seller" id="seller" className="border-[#4A4F41]/20 text-[#4A4F41]" />
                  <Label htmlFor="seller" className="text-[#4A4F41]/80">Sell Flowers</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4A4F41] text-white hover:bg-[#4A4F41]/90"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full bg-white border-[#4A4F41]/10 text-[#4A4F41] hover:bg-[#4A4F41]/5"
              >
                Already have an account? Sign in
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;