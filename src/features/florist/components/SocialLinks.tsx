import { Globe, Instagram, Facebook } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SocialLinksProps {
  links?: {
    website?: string;
    instagram?: string;
    facebook?: string;
  } | null;
}

export const SocialLinks = ({ links }: SocialLinksProps) => {
  if (!links) return null;

  return (
    <div className="flex gap-2 mt-4 pt-4 border-t">
      <TooltipProvider>
        {links.website && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <Globe className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visit website</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {links.instagram && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Follow on Instagram</p>
            </TooltipContent>
          </Tooltip>
        )}

        {links.facebook && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Follow on Facebook</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};