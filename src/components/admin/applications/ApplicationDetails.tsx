import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Application } from "@/types/application";

interface ApplicationDetailsProps {
  application: Application | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
}

export const ApplicationDetails = ({
  application,
  isOpen,
  onOpenChange,
  onApprove,
  onReject,
  isApproving,
}: ApplicationDetailsProps) => {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Review the application details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Full Name</h3>
              <p>{application.full_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Store Name</h3>
              <p>{application.store_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{application.email}</p>
            </div>
            <div>
              <h3 className="font-medium">Years Experience</h3>
              <p>{application.years_experience}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">About Business</h3>
            <p className="mt-1">{application.about_business}</p>
          </div>

          <div>
            <h3 className="font-medium">Specialties</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {application.specialties?.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {application.status === "pending" && (
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => onReject(application.id)}
              >
                Reject
              </Button>
              <Button
                onClick={() => onApprove(application.id)}
                disabled={isApproving}
              >
                {isApproving ? "Approving..." : "Approve"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};