import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, FileSpreadsheet, Lock, Receipt, ArrowLeft, Copy, Download, RefreshCw, Check, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getPaymentClause } from "@/services/aiContractService";
import { useAuth } from "@/contexts/AuthContext";

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
  clientEmail: string;
  clientAddress: string;
  projectName: string;
  scope: string;
  timeline: string;
  paymentTerms: string;
  jurisdiction: string;
  // SOW-specific fields
  deliverables?: string;
  milestones?: string;
  // Proposal-specific fields
  approach?: string;
  estimatedCost?: string;
}

interface ValidationErrors {
  clientName?: string;
  clientEmail?: string;
  scope?: string;
  paymentTerms?: string;
  profile?: string;
}

// Document type configuration
interface DocumentTypeConfig {
  id: DocumentType;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  projectLabel: string;
  projectPlaceholder: string;
  timelineLabel: string;
  timelinePlaceholder: string;
  showPaymentStructure: boolean;
  paymentRequired: boolean;
  showScopeOfWork: boolean;
  showRevisions: boolean;
  showIPOwnership: boolean;
  showTermination: boolean;
  showLiability: boolean;
  showJurisdiction: boolean;
  showDeliverables?: boolean;
  showMilestones?: boolean;
  showApproach?: boolean;
  showEstimatedCost?: boolean;
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

const documentTypes: DocumentTypeConfig[] = [
  {
    id: "contract",
    title: "Contract",
    subtitle: "Service agreement draft",
    icon: FileText,
    projectLabel: "Project / Service Name",
    projectPlaceholder: "e.g. Website Development",
    timelineLabel: "Project Duration (optional)",
    timelinePlaceholder: "e.g. 2 months, 6 weeks, Ongoing",
    showPaymentStructure: true,
    paymentRequired: true,
    showScopeOfWork: true,
    showRevisions: true,
    showIPOwnership: true,
    showTermination: true,
    showLiability: true,
    showJurisdiction: true,
  },
  {
    id: "nda",
    title: "NDA",
    subtitle: "Non-disclosure agreement draft",
    icon: Lock,
    projectLabel: "Context of Disclosure",
    projectPlaceholder: "e.g. Discussion about potential collaboration",
    timelineLabel: "Confidentiality Duration (optional)",
    timelinePlaceholder: "e.g. 2 years",
    showPaymentStructure: false,
    paymentRequired: false,
    showScopeOfWork: false,
    showRevisions: false,
    showIPOwnership: false,
    showTermination: false,
    showLiability: false,
    showJurisdiction: true,
  },
  {
    id: "sow",
    title: "SOW",
    subtitle: "Statement of work draft",
    icon: Receipt,
    projectLabel: "Project Name",
    projectPlaceholder: "e.g. Mobile App Development",
    timelineLabel: "Project Duration (optional)",
    timelinePlaceholder: "e.g. 3 months with milestones",
    showPaymentStructure: true,
    paymentRequired: false,
    showScopeOfWork: true,
    showRevisions: true,
    showIPOwnership: true,
    showTermination: true,
    showLiability: true,
    showJurisdiction: true,
    showDeliverables: true,
    showMilestones: true,
  },
  {
    id: "proposal",
    title: "Proposal",
    subtitle: "Project proposal draft",
    icon: FileSpreadsheet,
    projectLabel: "Proposal Summary",
    projectPlaceholder: "e.g. Website Redesign Project",
    timelineLabel: "Estimated Timeline (optional)",
    timelinePlaceholder: "e.g. 6-8 weeks",
    showPaymentStructure: true,
    paymentRequired: false,
    showScopeOfWork: true,
    showRevisions: false,
    showIPOwnership: false,
    showTermination: false,
    showLiability: false,
    showJurisdiction: false,
    showApproach: true,
    showEstimatedCost: true,
  },
];

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ isOpen, onClose, workspaceName, onDocumentSaved }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("select");
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData>({
    type: "contract",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    projectName: "",
    scope: "",
    timeline: "",
    paymentTerms: "50% Upfront / 50% on Completion",
    jurisdiction: "",
    deliverables: "",
    milestones: "",
    approach: "",
    estimatedCost: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Get current document type config
  const getCurrentConfig = (): DocumentTypeConfig | undefined => {
    return documentTypes.find(d => d.id === selectedType);
  };

  // Check if user profile is complete
  const isProfileComplete = () => {
    return !!(user?.name && user?.email);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    const config = getCurrentConfig();

    // Check profile completeness
    if (!isProfileComplete()) {
      errors.profile = "Complete your profile to generate documents.";
    }

    // Client name validation
    if (!documentData.clientName.trim()) {
      errors.clientName = "Client name is required.";
    } else if (documentData.clientName.trim().toLowerCase() === user?.name?.toLowerCase()) {
      errors.clientName = "Client name must not match Service Provider name.";
    }

    // Client email validation
    if (!documentData.clientEmail.trim()) {
      errors.clientEmail = "Client email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(documentData.clientEmail)) {
      errors.clientEmail = "Please enter a valid email address.";
    }

    // Scope validation
    if (!documentData.scope.trim()) {
      errors.scope = "This field is required.";
    } else if (documentData.scope.trim().length < 20) {
      errors.scope = "Please provide at least 20 characters.";
    }

    // Payment terms validation (only for Contract)
    if (config?.paymentRequired && !documentData.paymentTerms) {
      errors.paymentTerms = "Payment structure is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canGenerateDraft = (): boolean => {
    const config = getCurrentConfig();
    
    const baseValidation = 
      isProfileComplete() &&
      documentData.clientName.trim() !== "" &&
      documentData.clientName.trim().toLowerCase() !== user?.name?.toLowerCase() &&
      documentData.clientEmail.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(documentData.clientEmail) &&
      documentData.projectName.trim() !== "" &&
      documentData.scope.trim().length >= 20;

    // Add payment validation only if required
    if (config?.paymentRequired) {
      return baseValidation && documentData.paymentTerms !== "";
    }

    return baseValidation;
  };

  const handleTypeSelect = (type: DocumentType) => {
    setSelectedType(type);
    const config = documentTypes.find(d => d.id === type);
    setDocumentData({ 
      ...documentData, 
      type,
      paymentTerms: config?.showPaymentStructure ? "50% Upfront / 50% on Completion" : "",
    });
    setStep("form");
  };

  const handleGenerateDraft = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before generating the draft.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // For now, generate without AI (AI will be added later)
      const content = generateDocumentContent(documentData);
      
      setGeneratedContent(content);
      setStep("preview");
      toast.success("Draft generated successfully");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Generate document without AI (AI will be added later)
      const content = generateDocumentContent(documentData);
      
      setGeneratedContent(content);
      toast.success("Draft regenerated");
    } catch (error) {
      console.error("Regeneration error:", error);
      toast.error("Failed to regenerate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
    setValidationErrors({});
    setDocumentData({
      type: "contract",
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      projectName: "",
      scope: "",
      timeline: "",
      paymentTerms: "50% Upfront / 50% on Completion",
      jurisdiction: "",
      deliverables: "",
      milestones: "",
      approach: "",
      estimatedCost: "",
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
    const paymentClause = getPaymentClause(data.paymentTerms);
    const freelancerName = user?.name || "[Your Name]";
    const freelancerEmail = user?.email || "[Your Email]";
    const freelancerCompany = user?.company || "";
    
    switch (data.type) {
      case "contract":
        return `SERVICE AGREEMENT
Draft Agreement (AI-generated)

This Service Agreement ("Agreement") is entered into as of ${date}.

1. PARTIES

Service Provider: ${freelancerName}${freelancerCompany ? ` / ${freelancerCompany}` : ""}
Address: [Your Address]
Email: ${freelancerEmail}

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

Payment Structure: ${data.paymentTerms}

${paymentClause}

Late payments may result in work suspension until payment is received.

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
Print Name: ${freelancerName}

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

${data.approach ? `3. APPROACH\n\n${data.approach}\n\n` : ""}${data.deliverables ? `${data.approach ? "4" : "3"}. DELIVERABLES\n\n${data.deliverables}\n\n` : ""}${data.approach || data.deliverables ? (data.approach && data.deliverables ? "5" : "4") : "3"}. TIMELINE & MILESTONES

Project Duration: ${data.timeline || "To be discussed and agreed upon"}

${data.milestones || `Key Milestones:
• Project kickoff and discovery
• Design/development phase
• Review and revision rounds
• Final delivery and handoff

Specific dates will be established upon project commencement.`}

${data.approach || data.deliverables ? (data.approach && data.deliverables ? "6" : "5") : "4"}. INVESTMENT

${data.estimatedCost ? `Estimated Investment: ${data.estimatedCost}` : "Project Investment: To be discussed"}

${data.paymentTerms ? `Payment Structure: ${data.paymentTerms}

Payment Schedule:
• Initial deposit upon agreement signing
• Progress payments at key milestones
• Final payment upon project completion` : "Payment terms will be outlined in the service agreement."}

All fees are subject to the scope outlined above. Changes to scope may affect the total investment.

${data.approach || data.deliverables ? (data.approach && data.deliverables ? "7" : "6") : "5"}. PROCESS & COMMUNICATION

• Regular check-ins and progress updates
• Collaborative feedback and revision process
• Clear communication channels established
• Timely responses to questions and concerns

${data.approach || data.deliverables ? (data.approach && data.deliverables ? "8" : "7") : "6"}. WHAT I NEED FROM YOU

• Timely feedback on deliverables
• Access to necessary materials and information
• Clear communication of requirements
• Availability for scheduled meetings

${data.approach || data.deliverables ? (data.approach && data.deliverables ? "9" : "8") : "7"}. NEXT STEPS

1. Review this proposal and provide feedback
2. Schedule a call to discuss any questions
3. Sign the service agreement to begin work
4. Provide initial payment and project materials

I'm excited about the possibility of working together on this project. Please feel free to reach out with any questions.

Best regards,
${freelancerName}
${freelancerEmail}


---
DISCLAIMER:
This document is a draft for reference only.`;

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
Print Name: ${freelancerName}

Receiving Party: _______________________     Date: _______________
Print Name: ${data.clientName}


---
DISCLAIMER:
This document is AI-generated and provided for general reference only. Please consult a qualified legal professional before signing or sharing.`;

      case "sow":
        return `STATEMENT OF WORK
Draft Agreement (AI-generated)

Client: ${data.clientName}
Service Provider: ${freelancerName}${freelancerCompany ? ` / ${freelancerCompany}` : ""}
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

${data.deliverables || `The Service Provider will deliver:
• [Specific deliverable 1 based on scope]
• [Specific deliverable 2 based on scope]
• [Specific deliverable 3 based on scope]
• Documentation and source files as applicable
• Final handoff and knowledge transfer`}

All deliverables will be provided in the agreed-upon format.

4. TIMELINE & MILESTONES

Project Duration: ${data.timeline || "To be determined by mutual agreement"}

${data.milestones || `Key Milestones:
• Project kickoff: [Date]
• Phase 1 completion: [Date]
• Phase 2 completion: [Date]
• Final delivery: [Date]`}

Timelines are contingent upon timely feedback and materials from the Client.

5. PAYMENT SCHEDULE

${data.paymentTerms ? `Payment Structure: ${data.paymentTerms}

${getPaymentClause(data.paymentTerms)}` : `Total Project Fee: To be determined by mutual agreement

Payment Terms:
• Initial payment: [Amount] upon SOW signing
• Milestone payment(s): [Amount] at specified milestones
• Final payment: [Amount] upon project completion`}

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

${data.jurisdiction ? `15. GOVERNING LAW

This SOW shall be governed by the laws of ${data.jurisdiction}.

16. ENTIRE AGREEMENT` : `15. ENTIRE AGREEMENT`}

This SOW, together with any referenced agreements, constitutes the entire understanding between the parties.

Any modifications must be made in writing and signed by both parties.

${data.jurisdiction ? "17" : "16"}. SIGNATURES

By signing below, both parties agree to the terms and conditions outlined in this Statement of Work.

Service Provider: _______________________     Date: _______________
Print Name: ${freelancerName}

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
        {step === "form" && selectedType && (
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

            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Profile Completeness Warning */}
              {!isProfileComplete() && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">
                      Complete your profile to generate documents.
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Required: Full Name, Email
                    </p>
                  </div>
                </div>
              )}

              {/* 1. SERVICE PROVIDER (READ-ONLY) */}
              <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm">Service Provider (You)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{user?.name || "[Not set]"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user?.email || "[Not set]"}</span>
                  </div>
                  {user?.company && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium">{user.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. CLIENT DETAILS */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Client Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={documentData.clientName}
                    onChange={(e) => {
                      setDocumentData({ ...documentData, clientName: e.target.value });
                      if (validationErrors.clientName) {
                        setValidationErrors({ ...validationErrors, clientName: undefined });
                      }
                    }}
                    placeholder="Client or company name"
                    className={validationErrors.clientName ? "border-red-500" : ""}
                  />
                  {validationErrors.clientName && (
                    <p className="text-xs text-red-600">{validationErrors.clientName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={documentData.clientEmail}
                    onChange={(e) => {
                      setDocumentData({ ...documentData, clientEmail: e.target.value });
                      if (validationErrors.clientEmail) {
                        setValidationErrors({ ...validationErrors, clientEmail: undefined });
                      }
                    }}
                    placeholder="client@example.com"
                    className={validationErrors.clientEmail ? "border-red-500" : ""}
                  />
                  {validationErrors.clientEmail && (
                    <p className="text-xs text-red-600">{validationErrors.clientEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Client Address (optional)</Label>
                  <Input
                    id="clientAddress"
                    value={documentData.clientAddress}
                    onChange={(e) => setDocumentData({ ...documentData, clientAddress: e.target.value })}
                    placeholder="Client address"
                  />
                </div>
              </div>

              {/* 3. PROJECT / CONTEXT */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">
                  {getCurrentConfig()?.projectLabel || "Project Details"}
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    {getCurrentConfig()?.projectLabel || "Project Name"} *
                  </Label>
                  <Input
                    id="projectName"
                    value={documentData.projectName}
                    onChange={(e) => setDocumentData({ ...documentData, projectName: e.target.value })}
                    placeholder={getCurrentConfig()?.projectPlaceholder || "e.g. Website Development"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope">
                    {selectedType === "nda" ? "Context of Disclosure" : "Scope Summary"} *
                  </Label>
                  <Textarea
                    id="scope"
                    value={documentData.scope}
                    onChange={(e) => {
                      setDocumentData({ ...documentData, scope: e.target.value });
                      if (validationErrors.scope) {
                        setValidationErrors({ ...validationErrors, scope: undefined });
                      }
                    }}
                    placeholder={
                      selectedType === "nda" 
                        ? "Briefly describe the purpose of the discussion or information sharing."
                        : "Briefly describe the work (e.g. website development, app design)"
                    }
                    rows={4}
                    className={validationErrors.scope ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Minimum 20 characters
                    </p>
                    <p className={`text-xs ${documentData.scope.length < 20 ? "text-red-600" : "text-muted-foreground"}`}>
                      {documentData.scope.length}/20
                    </p>
                  </div>
                  {validationErrors.scope && (
                    <p className="text-xs text-red-600">{validationErrors.scope}</p>
                  )}
                </div>
              </div>

              {/* SOW-specific: Deliverables */}
              {getCurrentConfig()?.showDeliverables && (
                <div className="space-y-2">
                  <Label htmlFor="deliverables">Deliverables (optional)</Label>
                  <Textarea
                    id="deliverables"
                    value={documentData.deliverables}
                    onChange={(e) => setDocumentData({ ...documentData, deliverables: e.target.value })}
                    placeholder="List specific deliverables for this project"
                    rows={3}
                  />
                </div>
              )}

              {/* SOW-specific: Milestones */}
              {getCurrentConfig()?.showMilestones && (
                <div className="space-y-2">
                  <Label htmlFor="milestones">Milestones (optional)</Label>
                  <Textarea
                    id="milestones"
                    value={documentData.milestones}
                    onChange={(e) => setDocumentData({ ...documentData, milestones: e.target.value })}
                    placeholder="Define key project milestones"
                    rows={3}
                  />
                </div>
              )}

              {/* Proposal-specific: Approach */}
              {getCurrentConfig()?.showApproach && (
                <div className="space-y-2">
                  <Label htmlFor="approach">Approach (optional)</Label>
                  <Textarea
                    id="approach"
                    value={documentData.approach}
                    onChange={(e) => setDocumentData({ ...documentData, approach: e.target.value })}
                    placeholder="Describe your approach to this project"
                    rows={3}
                  />
                </div>
              )}

              {/* 4. TIMELINE / DURATION */}
              <div className="space-y-2">
                <Label htmlFor="timeline">
                  {getCurrentConfig()?.timelineLabel || "Timeline (optional)"}
                </Label>
                <Input
                  id="timeline"
                  value={documentData.timeline}
                  onChange={(e) => setDocumentData({ ...documentData, timeline: e.target.value })}
                  placeholder={getCurrentConfig()?.timelinePlaceholder || "e.g. 2 months"}
                />
              </div>

              {/* Proposal-specific: Estimated Cost */}
              {getCurrentConfig()?.showEstimatedCost && (
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost (optional)</Label>
                  <Input
                    id="estimatedCost"
                    value={documentData.estimatedCost}
                    onChange={(e) => setDocumentData({ ...documentData, estimatedCost: e.target.value })}
                    placeholder="e.g. $5,000 - $7,000"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is an estimate only, not a binding commitment
                  </p>
                </div>
              )}

              {/* 5. PAYMENT STRUCTURE (conditional) */}
              {getCurrentConfig()?.showPaymentStructure && (
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">
                    Payment Structure {getCurrentConfig()?.paymentRequired ? "*" : "(optional)"}
                  </Label>
                  <Select
                    value={documentData.paymentTerms}
                    onValueChange={(value) => {
                      setDocumentData({ ...documentData, paymentTerms: value });
                      if (validationErrors.paymentTerms) {
                        setValidationErrors({ ...validationErrors, paymentTerms: undefined });
                      }
                    }}
                  >
                    <SelectTrigger id="paymentTerms" className={validationErrors.paymentTerms ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select payment structure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50% Upfront / 50% on Completion">
                        50% Upfront / 50% on Completion <span className="text-xs text-muted-foreground">(Recommended)</span>
                      </SelectItem>
                      <SelectItem value="100% Upfront">
                        100% Upfront
                      </SelectItem>
                      <SelectItem value="Hourly (Billed Weekly)">
                        Hourly (Billed Weekly)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.paymentTerms && (
                    <p className="text-xs text-red-600">{validationErrors.paymentTerms}</p>
                  )}
                </div>
              )}

              {/* 6. JURISDICTION (conditional) */}
              {getCurrentConfig()?.showJurisdiction && (
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction (optional)</Label>
                  <Input
                    id="jurisdiction"
                    value={documentData.jurisdiction}
                    onChange={(e) => setDocumentData({ ...documentData, jurisdiction: e.target.value })}
                    placeholder="e.g. India, USA (leave blank if unsure)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank if unsure.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Button
                onClick={handleGenerateDraft}
                disabled={!canGenerateDraft() || isGenerating}
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
                This document is a draft for reference only.
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
                  <DialogTitle>Draft Agreement (AI-generated)</DialogTitle>
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
                <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-medium mb-1">This document is a draft for reference only.</p>
                  <p>
                    This is an AI-generated draft. Please consult a qualified legal professional before signing or sharing.
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