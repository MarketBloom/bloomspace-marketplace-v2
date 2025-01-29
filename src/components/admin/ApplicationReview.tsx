import { useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { REJECTION_REASONS } from '@/lib/applications/rejectFloristApplication'
import { approveFloristApplication } from '@/lib/applications/approveFloristApplication'
import { rejectFloristApplication } from '@/lib/applications/rejectFloristApplication'
import { validateApplication } from '@/lib/applications/validateApplication'

interface ApplicationReviewProps {
  application: any // Type this properly based on your application schema
  onComplete: () => void
}

export function ApplicationReview({ application, onComplete }: ApplicationReviewProps) {
  const [decision, setDecision] = useState<'approve' | 'reject'>()
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState<keyof typeof REJECTION_REASONS>()
  const [canReapply, setCanReapply] = useState(true)
  const [reapplyDays, setReapplyDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [validationResults, setValidationResults] = useState<any>(null)

  const handleValidate = () => {
    const results = validateApplication(application)
    setValidationResults(results)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (decision === 'approve') {
        await approveFloristApplication({
          applicationId: application.id,
          adminNotes,
          overrideValidation: false
        })
      } else if (decision === 'reject' && rejectionReason) {
        await rejectFloristApplication({
          applicationId: application.id,
          reason: rejectionReason,
          adminNotes,
          canReapply,
          reapplyAfterDays: reapplyDays
        })
      }
      onComplete()
    } catch (error) {
      console.error('Error processing application:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Application Review</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Results */}
          <Button onClick={handleValidate}>Run Validation</Button>
          {validationResults && (
            <div className="p-4 bg-gray-50 rounded">
              <pre>{JSON.stringify(validationResults, null, 2)}</pre>
            </div>
          )}

          {/* Decision */}
          <RadioGroup value={decision} onValueChange={(v: 'approve' | 'reject') => setDecision(v)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approve" id="approve" />
              <Label htmlFor="approve">Approve</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reject" id="reject" />
              <Label htmlFor="reject">Reject</Label>
            </div>
          </RadioGroup>

          {/* Rejection Options */}
          {decision === 'reject' && (
            <div className="space-y-4">
              <RadioGroup 
                value={rejectionReason} 
                onValueChange={(v: keyof typeof REJECTION_REASONS) => setRejectionReason(v)}
              >
                {Object.entries(REJECTION_REASONS).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{value.description}</Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex items-center space-x-2">
                <Switch checked={canReapply} onCheckedChange={setCanReapply} />
                <Label>Allow Reapplication</Label>
              </div>

              {canReapply && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={reapplyDays}
                    onChange={(e) => setReapplyDays(Number(e.target.value))}
                    min={1}
                    max={365}
                  />
                  <Label>Days until reapplication</Label>
                </div>
              )}
            </div>
          )}

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this decision..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !decision || (decision === 'reject' && !rejectionReason)}
          >
            {loading ? 'Processing...' : 'Submit Decision'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 