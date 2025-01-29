import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Application } from "@/types/application";
import { ApplicationTable } from "@/components/admin/applications/ApplicationTable";
import { ApplicationDetails } from "@/components/admin/applications/ApplicationDetails";

const ApplicationReview = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("florist_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch applications");
      return;
    }

    setApplications(data);
  };

  const handleApprove = async (id: string) => {
    setIsApproving(true);
    try {
      const { error } = await supabase.functions.invoke('approve-florist-application', {
        body: { applicationId: id }
      });

      if (error) throw error;

      toast.success("Application approved successfully");
      fetchApplications();
      setIsDetailsOpen(false);
    } catch (error: any) {
      console.error("Error approving application:", error);
      toast.error(error.message || "Failed to approve application");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("florist_applications")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Application rejected");
      fetchApplications();
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast.error("Failed to reject application");
    }
  };

  return (
    <AdminLayout currentPage="Applications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Florist Applications</h1>
        </div>

        <ApplicationTable
          applications={applications}
          onViewDetails={(app) => {
            setSelectedApp(app);
            setIsDetailsOpen(true);
          }}
        />

        <ApplicationDetails
          application={selectedApp}
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={isApproving}
        />
      </div>
    </AdminLayout>
  );
};

export default ApplicationReview;