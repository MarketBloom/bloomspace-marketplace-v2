import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PLACEHOLDER_FLORISTS = [
  {
    email: "marktheflorist@example.com",
    password: "placeholder123!",
    storeName: "Mark The Florist",
    phone: "+61 2 9363 1168"
  },
  {
    email: "flowerlaneandco@example.com",
    password: "placeholder123!",
    storeName: "Flower Lane & Co",
    phone: "+61 2 8317 5555"
  },
  {
    email: "fleurdeflo@example.com",
    password: "placeholder123!",
    storeName: "Fleur de Flo",
    phone: "+61 2 9331 6515"
  }
];

export const setupPlaceholderFlorists = async () => {
  try {
    console.log('Starting placeholder florists setup...');
    
    const { data, error } = await supabase.functions.invoke('setup-placeholder-florists', {
      body: { florists: PLACEHOLDER_FLORISTS }
    });

    if (error) {
      console.error('Setup error:', error);
      throw error;
    }

    console.log('Setup response:', data);
    toast.success("All placeholder florists have been created successfully!");
  } catch (error) {
    console.error("Error setting up placeholder florists:", error);
    toast.error("Failed to create placeholder florists");
  }
};