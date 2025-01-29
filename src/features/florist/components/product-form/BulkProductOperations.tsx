import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Download, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product, BulkProductOperation } from "@/types/product";
import Papa from "papaparse";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { BulkEditProducts } from "./BulkEditProducts";

export interface BulkProductOperationsProps {
  floristId: string;
  onProductsUploaded: (options?: RefetchOptions) => Promise<QueryObserverResult<any[], Error>>;
  products: Product[];
}

export const BulkProductOperations = ({ 
  floristId, 
  onProductsUploaded, 
  products 
}: BulkProductOperationsProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("import");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<BulkProductOperation | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setImportFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setOperation({
      operation: "import",
      status: "processing",
      total_records: 0,
      processed_records: 0,
      failed_records: 0,
      error_log: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    try {
      const text = await importFile.text();
      Papa.parse(text, {
        header: true,
        complete: async (results) => {
          const records = results.data as any[];
          setOperation(prev => ({
            ...prev!,
            total_records: records.length
          }));

          for (let i = 0; i < records.length; i++) {
            try {
              const record = records[i];
              const { error } = await supabase
                .from("products")
                .insert({
                  florist_id: floristId,
                  title: record.title,
                  description: record.description,
                  price: parseFloat(record.price),
                  sale_price: record.sale_price ? parseFloat(record.sale_price) : null,
                  category: record.category,
                  occasion: record.occasions?.split(",").map((o: string) => o.trim()),
                  tags: record.tags?.split(",").map((t: string) => t.trim()),
                  status: record.status || "draft",
                  stock_quantity: parseInt(record.stock_quantity) || 0,
                  low_stock_threshold: parseInt(record.low_stock_threshold) || 5
                });

              if (error) throw error;

              setOperation(prev => ({
                ...prev!,
                processed_records: (prev?.processed_records || 0) + 1
              }));
            } catch (error: any) {
              setOperation(prev => ({
                ...prev!,
                failed_records: (prev?.failed_records || 0) + 1,
                error_log: [...(prev?.error_log || []), `Row ${i + 1}: ${error.message}`]
              }));
            }
          }

          setOperation(prev => ({
            ...prev!,
            status: "completed",
            updated_at: new Date().toISOString()
          }));

          onProductsUploaded();
          toast({
            title: "Import completed",
            description: `Successfully imported ${operation?.processed_records} products. ${operation?.failed_records} failed.`
          });
        },
        error: (error) => {
          setOperation(prev => ({
            ...prev!,
            status: "failed",
            error_log: [...(prev?.error_log || []), error.message],
            updated_at: new Date().toISOString()
          }));
          toast({
            title: "Import failed",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    } catch (error: any) {
      setOperation(prev => ({
        ...prev!,
        status: "failed",
        error_log: [...(prev?.error_log || []), error.message],
        updated_at: new Date().toISOString()
      }));
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    setOperation({
      operation: "export",
      status: "processing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("florist_id", floristId);

      if (error) throw error;

      const csv = Papa.unparse(data.map(product => ({
        title: product.title,
        description: product.description,
        price: product.price,
        sale_price: product.sale_price,
        category: product.category,
        occasions: product.occasion?.join(", "),
        tags: product.tags?.join(", "),
        status: product.status,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold
      })));

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setOperation(prev => ({
        ...prev!,
        status: "completed",
        total_records: data.length,
        processed_records: data.length,
        file_url: url,
        updated_at: new Date().toISOString()
      }));

      toast({
        title: "Export completed",
        description: `Successfully exported ${data.length} products`
      });
    } catch (error: any) {
      setOperation(prev => ({
        ...prev!,
        status: "failed",
        error_log: [...(prev?.error_log || []), error.message],
        updated_at: new Date().toISOString()
      }));
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => {
          setActiveTab("import");
          setShowDialog(true);
        }}>
          <Upload className="h-4 w-4 mr-2" />
          Import Products
        </Button>
        <Button onClick={() => {
          setActiveTab("export");
          setShowDialog(true);
        }}>
          <Download className="h-4 w-4 mr-2" />
          Export Products
        </Button>
        <Button onClick={() => {
          setActiveTab("bulk-edit");
          setShowDialog(true);
        }}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Bulk Edit
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk Product Operations</DialogTitle>
            <DialogDescription>
              Import, export, or bulk edit your products
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="bulk-edit">Bulk Edit</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="importFile">Select CSV File</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </div>

              {importFile && (
                <Button onClick={handleImport} disabled={operation?.status === "processing"}>
                  Start Import
                </Button>
              )}

              {operation?.operation === "import" && operation.status === "processing" && (
                <div className="space-y-2">
                  <Progress value={
                    operation.total_records
                      ? (operation.processed_records! / operation.total_records) * 100
                      : 0
                  } />
                  <p className="text-sm text-muted-foreground">
                    Processing {operation.processed_records} of {operation.total_records} records...
                  </p>
                </div>
              )}

              {operation?.error_log?.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {operation.error_log.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Button onClick={handleExport} disabled={operation?.status === "processing"}>
                Download CSV
              </Button>

              {operation?.operation === "export" && operation.status === "processing" && (
                <p className="text-sm text-muted-foreground">
                  Preparing export...
                </p>
              )}
            </TabsContent>

            <TabsContent value="bulk-edit">
              <BulkEditProducts
                onClose={() => setShowDialog(false)}
                onSuccess={onProductsUploaded}
                products={products}
                onProductsUpdated={onProductsUploaded}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};