import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, FileSpreadsheet, Lock, Receipt, ArrowLeft, Copy, Download, RefreshCw, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

type DocumentType = "contract" | "proposal" | "nda" | "sow";
type Step = "select" | "form" | "preview";

export interface SavedDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
}

interface DocumentData {
  type: DocumentType;
  clientName: string;
  projectName: string;
  scope: string;
  timeline: string;
  paymentTerms: string;
  jurisdiction: string;
}

interface DocumentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
  onDocumentSaved?: (document: SavedDocument) => void;
}

interface SavedDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
}

const documentTypes = [
  {
    id: "contract" as DocumentType,
    title: "Contract",
    subtitle: "Service agreement draft",
    icon: FileText,
  },
  {
    id: "proposal" as DocumentType,
    title: "Proposal",
    subtitle: "Project proposal draft",
    icon: FileSpreadsheet,
  },
  {
    id: "nda" as DocumentType,
    title: "NDA",
    subtitle: "Non-disclosure agreement draft",
    icon: Lock,
  },
  {
    id: "sow" as DocumentType,
    title: "SOW",
    subtitle: "Statement of work draft",
    icon: Receipt,
  },
];

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ isOpen, onClose, workspaceName, onDocumentSaved }) => {
  const [step, setStep] = useState<Step>("select");
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData>({
    type: "contract",
    clientName: workspaceName || "",
    projectName: "",
    scope: "",
    timeline: "",
    paymentTerms: "",
    jurisdiction: "",
  });

  const handleTypeSelect = (type: DocumentType) => {
    setSelectedType(type);
    setDocumentData({ ...documentData, type });
    setStep("form");
  };

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const content = generateDocumentContent(documentData);
      setGeneratedContent(content);
      setStep("preview");
      setIsGenerating(false);
    }, 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const content = generateDocumentContent(documentData);
      setGeneratedContent(content);
      setIsGenerating(false);
      toast.success("Draft regenerated");
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType}-draft-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Draft downloaded");
  };

  const handleClose = () => {
    setStep("select");
    setSelectedType(null);
    setGeneratedContent("");
    setUnderstood(false);
    setDocumentData({
      type: "contract",
      clientName: workspaceName || "",
      projectName: "",
      scope: "",
      timeline: "",
      paymentTerms: "",
      jurisdiction: "",
    });
    onClose();
  };

  const handleSaveDocument = () => {
    if (!understood) return;

    const savedDoc: SavedDocument = {
      id: Date.now().toString(),
      type: selectedType!,
      title: `${getDocumentTitle()} - ${documentData.clientName}`,
      content: generatedContent,
      createdAt: new Date().toISOString(),
    };

    if (onDocumentSaved) {
      onDocumentSaved(savedDoc);
    }

    toast.success("Document saved successfully");
    handleClose();
  };

  const generateDocumentContent = (data: DocumentData): string => {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    
    switch (data.type) {
      case "contract":
        return `SERVICE AGREEMENT
Draft Agreement (AI-generated)

This Service Agreement ("Agreement") is entered into as of ${date}.

1. PARTIES

Service Provider: [Your Name/Company]
Address: [Your Address]
Email: [Your Email]

Client: ${data.clientName}
Address: [Client Address]
Email: [Client Email]

2. PROJECT / SCOPE OF WORK

Project Name: ${data.projectName}

Scope:
${data.scope}

The Service Provider agrees to perform the services described above in a professional and timely manner.

3. TIMELINE

Project Duration: ${data.timeline || "To be determined by mutual agreement"}

Milestones and deadlines will be communicated and agreed upon by both parties.

4. PAYMENT TERMS

Payment Structure: ${data.paymentTerms || "To be determined by mutual agreement"}

Payment is due according to the schedule agreed upon. Late payments may result in work suspension until payment is received.

5. REVISIONS & SCOPE CONTROL

Any work outside the agreed scope may require additional time and fees, subject to mutual agreement.

The Client is entitled to reasonable revisions within the original scope. Additional revisions beyond the agreed scope will be billed separately.

6. INDEPENDENT CONTRACTOR

The Service Provider is an independent contractor and is not an employee, partner, or legal representative of the Client.

The Service Provider is responsible for their own taxes, insurance, and business expenses.

7. INTELLECTUAL PROPERTY

Upon full payment, the Client will own the final deliverables. The Service Provider retains the right to use the work in their portfolio unless otherwise agreed.

Work-in-progress materials and preliminary designs remain the property of the Service Provider until final payment is received.

8. CONFIDENTIALITY

Both parties agree to keep confidential any proprietary information shared during the course of this project.

Confidential information shall not be disclosed to third parties without prior written consent.

9. LIMITATION OF LIABILITY

The Service Provider shall not be liable for indirect, incidental, or consequential damages arising from the services provided.

The Service Provider's total liability shall not exceed the total amount paid under this Agreement.

10. TERMINATION

Either party may terminate this Agreement with written notice. Payment will be due for work completed up to the termination date.

Upon termination, the Service Provider will deliver all completed work and the Client will pay for services rendered.

11. FORCE MAJEURE

Neither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control.

12. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the parties and supersedes all prior discussions or agreements.

Any modifications must be made in writing and signed by both parties.

13. GOVERNING LAW

This Agreement shall be governed by the laws of ${data.jurisdiction || "[Jurisdiction to be specified]"}.

Any disputes shall be resolved through good faith negotiation or mediation before pursuing legal action.

14. SIGNATURES

By signing below, both parties agree to the terms and conditions outlined in this Agreement.

Service Provider: _______________________     Date: _______________
Print Name: [Your Name]

Client: _______________________     Date: _______________
Print Name: ${data.clientName}


---
DISCLAIMER:
This document is AI-generated and provided for general reference only. Please consult a qualified legal professional before signing or sharing.`;

      case "proposal":
        return `PROJECT PROPOSAL
Draft Proposal (AI-generated)

Prepared for: ${data.clientName}
Date: ${date}

1. PROJECT OVERVIEW

Project Name: ${data.projectName}

Thank you for the opportunity to submit this proposal. This document outlines the scope, timeline, and investment for the proposed project.

2. SCOPE OF WORK

${data.scope}

Deliverables:
• Detailed project deliverables based on the scope outlined above
• Regular progress updates and communication
• Final delivery with documentation and handoff
• Post-delivery support as specified

3. TIMELINE & MILESTONES

Project Duration: ${data.timeline || "To be discussed and agreed upon"}

Key Milestones:
• Project kickoff and discovery
• Design/development phase
• Review and revision rounds
• Final delivery and handoff

Specific dates will be established upon project commencement.

4. INVESTMENT

Project Investment: ${data.paymentTerms || "To be discussed"}

Payment Schedule:
• Initial deposit upon agreement signing
• Progress payments at key milestones
• Final payment upon project completion

All fees are subject to the scope outlined above. Changes to scope may affect the total investment.

5. PROCESS & COMMUNICATION

• Regular check-ins and progress updates
• Collaborative feedback and revision process
• Clear communication channels established
• Timely responses to questions and concerns

6. WHAT I NEED FROM YOU

• Timely feedback on deliverables
• Access to necessary materials and information
• Clear communication of requirements
• Availability for scheduled meetings

7. TERMS & CONDITIONS

• Work begins upon signed agreement and initial payment
• Revisions within scope are included; additional work may incur extra fees
• Final deliverables provided upon full payment
• Intellectual property transfers upon completion and payment

8. NEXT STEPS

1. Review this proposal and provide feedback
2. Schedule a call to discuss any questions
3. Sign the service agreement to begin work
4. Provide initial payment and project materials

I'm excited about the possibility of working together on this project. Please feel free to reach out with any questions.

Best regards,
[Your Name]


---
DISCLAIMER:
This document is AI-generated and provided for general reference only. Please consult a qualified legal professional before signing or sharing.`;

      case "nda":
        return `NON-DISCLOSURE AGREEMENT
Draft Agreement (AI-generated)

This Non-Disclosure Agreement ("Agreement") is entered into as of ${date}.

1. PARTIES

Disclosing Party: [Your Name/Company]
Address: [Your Address]

Receiving Party: ${data.clientName}
Address: [Client Address]

2. PURPOSE

The parties wish to explore a business relationship regarding: ${data.projectName}

This Agreement is intended to protect confidential information that may be disclosed during discussions.

3. DEFINITION OF CONFIDENTIAL INFORMATION

"Confidential Information" includes:
• Business plans, strategies, and financial information
• Technical data, designs, and processes
• Client lists and business relationships
• Any information marked as confidential or that would reasonably be considered confidential

Confidential Information does NOT include:
• Information already in the public domain
• Information independently developed by the Receiving Party
• Information received from a third party without breach of confidentiality

4. CONTEXT OF DISCLOSURE

Project / Discussion Context:
${data.scope}

5. OBLIGATIONS OF RECEIVING PARTY

The Receiving Party agrees to:
• Keep all Confidential Information strictly confidential
• Not disclose Confidential Information to third parties without prior written consent
• Use Confidential Information solely for the purpose stated above
• Protect Confidential Information with the same care used for their own confidential information

6. PERMITTED DISCLOSURES

The Receiving Party may disclose Confidential Information:
• To employees or contractors who need to know and are bound by similar confidentiality obligations
• When required by law, with prior notice to the Disclosing Party when possible

7. RETURN OF MATERIALS

Upon request or termination of discussions, the Receiving Party will:
• Return or destroy all Confidential Information
• Certify in writing that all materials have been returned or destroyed

8. NO LICENSE OR RIGHTS

This Agreement does not grant any license, rights, or ownership in the Confidential Information.

All Confidential Information remains the property of the Disclosing Party.

9. TERM

This Agreement shall remain in effect for ${data.timeline || "a period of [specify duration]"} from the date of signing.

The confidentiality obligations shall continue to apply even after this Agreement ends.

10. LIMITATION OF LIABILITY

Neither party shall be liable for indirect, incidental, or consequential damages arising from this Agreement.

11. NO OBLIGATION TO PROCEED

This Agreement does not obligate either party to enter into any business relationship or transaction.

12. GOVERNING LAW

This Agreement shall be governed by the laws of ${data.jurisdiction || "[Jurisdiction to be specified]"}.

13. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the parties regarding confidentiality.

Any modifications must be made in writing and signed by both parties.

14. SIGNATURES

By signing below, both parties agree to the terms and conditions outlined in this Agreement.

Disclosing Party: _______________________     Date: _______________
Print Name: [Your Name]

Receiving Party: _______________________     Date: _______________
Print Name: ${data.clientName}


---
DISCLAIMER:
This document is AI-generated and provided for general reference only. Please consult a qualified legal professional before signing or sharing.`;

      case "sow":
        return `STATEMENT OF WORK
Draft Agreement (AI-generated)

Client: ${data.clientName}
Service Provider: [Your Name/Company]
Date: ${date}

1. PROJECT OVERVIEW

Project Name: ${data.projectName}

This Statement of Work ("SOW") outlines the specific services, deliverables, timeline, and terms for the project described above.

2. SCOPE OF WORK

${data.scope}

In-Scope Activities:
• All work items described in the scope above
• Regular communication and progress updates
• Reasonable revisions within the defined scope
• Final delivery and handoff

Out-of-Scope:
• Any work not explicitly mentioned above
• Additional features or services not agreed upon
• Ongoing maintenance beyond the delivery date (unless specified)

3. DELIVERABLES

The Service Provider will deliver:
• [Specific deliverable 1 based on scope]
• [Specific deliverable 2 based on scope]
• [Specific deliverable 3 based on scope]
• Documentation and source files as applicable
• Final handoff and knowledge transfer

All deliverables will be provided in the agreed-upon format.

4. TIMELINE & MILESTONES

Project Duration: ${data.timeline || "To be determined by mutual agreement"}

Key Milestones:
• Project kickoff: [Date]
• Phase 1 completion: [Date]
• Phase 2 completion: [Date]
• Final delivery: [Date]

Timelines are contingent upon timely feedback and materials from the Client.

5. PAYMENT SCHEDULE

Total Project Fee: ${data.paymentTerms || "To be determined by mutual agreement"}

Payment Terms:
• Initial payment: [Amount] upon SOW signing
• Milestone payment(s): [Amount] at specified milestones
• Final payment: [Amount] upon project completion

Late payments may result in work suspension until payment is received.

6. REVISIONS & SCOPE CONTROL

Any work outside the agreed scope may require additional time and fees, subject to mutual agreement.

Included revisions: [Specify number] rounds of revisions within the defined scope.

Additional revisions or scope changes will be documented and may incur additional fees.

7. CLIENT RESPONSIBILITIES

The Client agrees to:
• Provide timely feedback (within [X] business days)
• Supply necessary materials, access, and information
• Be available for scheduled meetings and check-ins
• Review and approve deliverables at each milestone

Delays in Client feedback may impact the project timeline.

8. ACCEPTANCE CRITERIA

Work will be considered complete when:
• All deliverables meet the specifications outlined in this SOW
• The Client has reviewed and approved the final deliverables
• Any agreed-upon revisions have been completed

9. INDEPENDENT CONTRACTOR

The Service Provider is an independent contractor and is not an employee, partner, or legal representative of the Client.

The Service Provider is responsible for their own taxes, insurance, and business expenses.

10. INTELLECTUAL PROPERTY

Upon full payment, the Client will own the final deliverables.

The Service Provider retains the right to use the work in their portfolio unless otherwise agreed in writing.

11. CONFIDENTIALITY

Both parties agree to keep confidential any proprietary information shared during the course of this project.

12. LIMITATION OF LIABILITY

The Service Provider shall not be liable for indirect, incidental, or consequential damages arising from the services provided.

The Service Provider's total liability shall not exceed the total project fee.

13. TERMINATION

Either party may terminate this SOW with written notice. Payment will be due for work completed up to the termination date.

Upon termination, the Service Provider will deliver all completed work and the Client will pay for services rendered.

14. CHANGE REQUESTS

Any changes to the scope, timeline, or deliverables must be documented in writing.

Change requests may affect the project timeline and total fee, subject to mutual agreement.

15. GOVERNING LAW

This SOW shall be governed by the laws of ${data.jurisdiction || "[Jurisdiction to be specified]"}.

16. ENTIRE AGREEMENT

This SOW, together with any referenced agreements, constitutes the entire understanding between the parties.

Any modifications must be made in writing and signed by both parties.

17. SIGNATURES

By signing below, both parties agree to the terms and conditions outlined in this Statement of Work.

Service Provider: _______________________     Date: _______________
Print Name: [Your Name]

Client: _______________________     Date: _______________
Print Name: ${data.clientName}


---
DISCLAIMER:
This document is AI-generated and provided for general reference only. Please consult a qualified legal professional before signing or sharing.`;

      default:
        return "";
    }
  };

  const getDocumentTitle = () => {
    const doc = documentTypes.find(d => d.id === selectedType);
    return doc?.title || "Document";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={step === "preview" ? "max-w-5xl max-h-[90vh]" : "max-w-2xl"}>
        {/* STEP 1: Select Document Type */}
        {step === "select" && (
          <>
            <DialogHeader>
              <DialogTitle>Generate Draft</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                {documentTypes.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <Button
                      key={doc.id}
                      variant="outline"
                      className="h-32 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => handleTypeSelect(doc.id)}
                    >
                      <Icon className="h-8 w-8" />
                      <div className="text-center">
                        <p className="font-semibold">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Select a document type to generate a draft using AI</p>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p>
                  This document is AI-generated and provided for general reference only. 
                  Please consult a qualified legal professional before signing or sharing.
                </p>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: Document Context Form */}
        {step === "form" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("select")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <DialogTitle>{getDocumentTitle()} Draft</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={documentData.clientName}
                  onChange={(e) => setDocumentData({ ...documentData, clientName: e.target.value })}
                  placeholder="Client or company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectName">Project / Service Name *</Label>
                <Input
                  id="projectName"
                  value={documentData.projectName}
                  onChange={(e) => setDocumentData({ ...documentData, projectName: e.target.value })}
                  placeholder="e.g. Website Redesign"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Scope Summary *</Label>
                <Textarea
                  id="scope"
                  value={documentData.scope}
                  onChange={(e) => setDocumentData({ ...documentData, scope: e.target.value })}
                  placeholder="Brief description of work or project scope"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline (optional)</Label>
                <Input
                  id="timeline"
                  value={documentData.timeline}
                  onChange={(e) => setDocumentData({ ...documentData, timeline: e.target.value })}
                  placeholder="e.g. 4 weeks, 2 months"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms (optional)</Label>
                <Input
                  id="paymentTerms"
                  value={documentData.paymentTerms}
                  onChange={(e) => setDocumentData({ ...documentData, paymentTerms: e.target.value })}
                  placeholder="e.g. 50% upfront, 50% on completion"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction (optional)</Label>
                <Input
                  id="jurisdiction"
                  value={documentData.jurisdiction}
                  onChange={(e) => setDocumentData({ ...documentData, jurisdiction: e.target.value })}
                  placeholder="e.g. India, USA, UK"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Button
                onClick={handleGenerateDraft}
                disabled={!documentData.clientName || !documentData.projectName || !documentData.scope || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Generating Draft...
                  </>
                ) : (
                  <>
                    Generate Draft
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                AI-generated draft. Review carefully before use.
              </p>
            </div>
          </>
        )}

        {/* STEP 3: Preview Generated Draft */}
        {step === "preview" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("form")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <DialogTitle>{getDocumentTitle()} Draft</DialogTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Document Preview */}
              <div className="bg-white border rounded-lg p-8 max-h-[50vh] overflow-y-auto">
                {isEditing ? (
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    onBlur={() => setIsEditing(false)}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditing(true)}
                    className="whitespace-pre-wrap font-mono text-sm cursor-pointer hover:bg-gray-50 p-4 rounded transition-colors"
                  >
                    {generatedContent}
                  </div>
                )}
              </div>

              {/* Disclaimer and Confirmation */}
              <div className="space-y-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p>
                    This document is AI-generated and provided for general reference only. 
                    Please consult a qualified legal professional before signing or sharing.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    I understand this is an AI-generated draft and not legal advice.
                  </span>
                </label>

                <Button
                  onClick={handleSaveDocument}
                  disabled={!understood}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentGenerator;