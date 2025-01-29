import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CrawlResult {
  success: boolean;
  status?: string;
  error?: string;
  details?: any;
  data?: {
    url: string;
    crawledAt: string;
    content: any;
  };
}

export const WebsiteCrawler = ({ floristId }: { floristId: string }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Remove any trailing colons from the hostname
      urlObj.hostname = urlObj.hostname.replace(/:+$/, '');
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL starting with http:// or https://",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setProgress(25);
    setCrawlResult(null);
    
    try {
      const normalizedUrl = normalizeUrl(url);
      console.log('Starting crawl for URL:', normalizedUrl);
      setProgress(50);
      
      const { data: response, error: supabaseError } = await supabase.functions.invoke('crawl-website', {
        body: { url: normalizedUrl, floristId }
      });

      console.log('Received response:', response);

      if (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        throw new Error(supabaseError.message);
      }

      if (!response?.crawlResult) {
        throw new Error('Invalid response format');
      }

      setCrawlResult(response.crawlResult);
      setProgress(100);
      
      if (response.crawlResult.success) {
        toast({
          title: "Success",
          description: "Website data extracted successfully",
          duration: 3000,
        });
      } else {
        throw new Error(response.crawlResult.error || 'Failed to extract website data');
      }
    } catch (error) {
      console.error('Error crawling website:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process website",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Import from Website</h2>
        <p className="text-sm text-gray-500">
          Enter your website URL to import your products and store information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium text-gray-700">
            Website URL
          </label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-flower-shop.com"
            disabled={isLoading}
            required
          />
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500 text-center">
              Processing your website... This may take a few moments
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Import Data"
          )}
        </Button>
      </form>

      {crawlResult && (
        <div className="space-y-4">
          {crawlResult.error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {crawlResult.error}
                {crawlResult.details && (
                  <pre className="mt-2 text-xs whitespace-pre-wrap">
                    {JSON.stringify(crawlResult.details, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <h3 className="text-md font-semibold">Extracted Data</h3>
              <div className="space-y-2 text-sm">
                <p>Status: {crawlResult.status}</p>
                <p>Crawled at: {new Date(crawlResult.data?.crawledAt || '').toLocaleString()}</p>
                {crawlResult.data?.content && (
                  <div className="mt-4">
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
                      {JSON.stringify(crawlResult.data.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};