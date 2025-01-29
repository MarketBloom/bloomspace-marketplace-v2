import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Link as LinkIcon,
} from "lucide-react";

const socialLinksSchema = z.object({
  website: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
  facebook: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
  instagram: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
  twitter: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
  youtube: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
  other: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
});

type SocialLinksValues = z.infer<typeof socialLinksSchema>;

const defaultValues: SocialLinksValues = {
  website: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
  other: "",
};

interface SocialLinksFormProps {
  onSubmit: (values: SocialLinksValues) => Promise<void>;
  initialValues?: Partial<SocialLinksValues>;
}

export function SocialLinksForm({
  onSubmit,
  initialValues,
}: SocialLinksFormProps) {
  const form = useForm<SocialLinksValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="https://your-website.com"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>Your main business website</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="https://facebook.com/your-page"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="https://instagram.com/your-profile"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="https://twitter.com/your-profile"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="https://youtube.com/your-channel"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="other"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Link</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="https://other-social-media.com"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>Any other social media link</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Save Social Links</Button>
      </form>
    </Form>
  );
}
