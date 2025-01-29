import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FloristApplicationForm } from "@/components/florist-application/FloristApplicationForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FloristApplication = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("florist_applications")
        .insert([formData]);

      if (error) throw error;

      toast.success(
        "Application submitted successfully! We'll review your application and get back to you soon."
      );
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Join Our Curated Marketplace
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're building a network of the most talented florists in each city.
              Tell us about your business, and let's explore how we can grow
              together.
            </p>
          </div>
          <FloristApplicationForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default FloristApplication;