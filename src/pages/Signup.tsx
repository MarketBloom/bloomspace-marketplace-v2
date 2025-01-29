import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters long</p>
              </div>
              <div>
                <label className="block mb-1">I want to *</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="buyer"
                      checked={formData.user_type === "buyer"}
                      onChange={(e) => setFormData({ ...formData, user_type: "buyer" })}
                      className="mr-2"
                    />
                    Buy Flowers
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="seller"
                      checked={formData.user_type === "seller"}
                      onChange={(e) => setFormData({ ...formData, user_type: "seller" })}
                      className="mr-2"
                    />
                    Sell Flowers
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white p-2 rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full p-2 rounded border hover:bg-gray-50"
                >
                  Skip for now
                </button>
              </div>
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;