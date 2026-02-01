import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, RefreshCw, Send, Plus, Sparkles, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { hasFeatureAccess } from "@/utils/planFeatures";

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: "active" | "inactive" | "prospect";
  totalProjects?: number;
  totalRevenue?: number;
  lastContact?: string;
  notes?: string;
}

type Screen = "input" | "review" | "recipients";

// Step Indicator Component
const StepIndicator: React.FC<{ currentStep: Screen }> = ({ currentStep }) => {
  const steps = [
    { id: "input", label: "Update" },
    { id: "review", label: "Review" },
    { id: "recipients", label: "Send" }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${index < currentIndex ? "bg-primary text-white" : ""}
              ${index === currentIndex ? "bg-primary text-white" : ""}
              ${index > currentIndex ? "bg-gray-200 text-gray-400" : ""}
            `}>
              {index < currentIndex ? <Check className="h-3 w-3" /> : index + 1}
            </div>
            <span className={`text-sm ${index === currentIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-px ${index < currentIndex ? "bg-primary" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ClientUpdates: React.FC = () => {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>("input");
  const [userInput, setUserInput] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: "",
    body: ""
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [sendScope, setSendScope] = useState<"all" | "selected">("all");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [newClient, setNewClient] = useState({ name: "", email: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);

  const hasClientUpdatesAccess = hasFeatureAccess(user?.plan, "clientManagement");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    const stored = localStorage.getItem("clients");
    if (stored) {
      setClients(JSON.parse(stored));
    }
  };

  const saveClients = (updatedClients: Client[]) => {
    localStorage.setItem("clients", JSON.stringify(updatedClients));
    setClients(updatedClients);
  };

  const generateEmail = async () => {
    if (!userInput.trim()) {
      toast.error("Please enter what you want to tell your clients");
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const subject = generateSubject(userInput);
      const body = generateBody(userInput);
      
      setGeneratedEmail({ subject, body });
      setScreen("review");
      setIsGenerating(false);
    }, 1500);
  };

  const generateSubject = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("discount") || lowerInput.includes("off") || lowerInput.includes("%")) {
      return "Special Offer Just for You";
    }
    if (lowerInput.includes("new service") || lowerInput.includes("now offering")) {
      return "Exciting New Service Available";
    }
    if (lowerInput.includes("available") || lowerInput.includes("capacity")) {
      return "I Have Availability for New Projects";
    }
    
    return "Quick Update from Me";
  };

  const generateBody = (input: string): string => {
    return `Hi {{client_name}},

I hope this message finds you well!

I wanted to reach out with a quick update: ${input}

I'd love to work with you again if you have any upcoming projects or know someone who might benefit from my services.

Feel free to reply to this email or schedule a quick call at your convenience.

Best regards,
${user?.name || "Your Name"}`;
  };

  const regenerateEmail = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const body = `Hello {{client_name}},

Hope you're doing great!

${userInput}

If you're interested or have any questions, I'm just an email away. Would love to catch up and see how I can help with your next project.

Looking forward to hearing from you!

Warm regards,
${user?.name || "Your Name"}`;

      setGeneratedEmail({ ...generatedEmail, body });
      setIsGenerating(false);
      toast.success("Email regenerated");
    }, 1000);
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) {
      toast.error("Name and email are required");
      return;
    }

    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      status: "active",
      totalProjects: 0,
      totalRevenue: 0,
      lastContact: new Date().toISOString()
    };

    const updatedClients = [...clients, client];
    saveClients(updatedClients);
    setSelectedClients([...selectedClients, client.id]);
    setIsAddingClient(false);
    setNewClient({ name: "", email: "" });
    toast.success("Client added and selected");
  };

  const handleSendUpdate = () => {
    if (!hasClientUpdatesAccess && sendScope === "all") {
      toast.error("Send updates to all your clients in one click — available in Pro.", {
        duration: 4000,
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/settings?tab=pricing"
        }
      });
      return;
    }

    const recipientCount = sendScope === "all" ? clients.length : selectedClients.length;

    if (recipientCount === 0) {
      toast.error("Please select at least one client");
      return;
    }

    toast.success(`Update sent to ${recipientCount} client${recipientCount > 1 ? "s" : ""}`);
    
    // Reset
    setScreen("input");
    setUserInput("");
    setGeneratedEmail({ subject: "", body: "" });
    setSelectedClients([]);
    setSendScope("all");
  };

  const toggleClientSelection = (id: string) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const recipientCount = sendScope === "all" ? clients.length : selectedClients.length;

  // Feature gate: Only Pro Plus users can access Client Updates
  if (!hasClientUpdatesAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto py-8 pt-24 max-w-3xl">
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="bg-primary/10 rounded-full p-6">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-3">Client Updates</h1>
                <p className="text-muted-foreground text-lg mb-6">
                  Send offers, announcements, or quick updates to your clients in one click
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md">
                <p className="text-amber-900 font-medium mb-2">Pro Plus Feature</p>
                <p className="text-amber-800 text-sm">
                  Upgrade to Pro Plus to unlock Client Updates and send bulk emails to all your clients.
                </p>
              </div>
              <Button 
                size="lg"
                className="rounded-full px-8"
                onClick={() => window.location.href = "/settings?tab=pricing"}
              >
                Upgrade to Pro Plus
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 pt-24 max-w-3xl">
        <StepIndicator currentStep={screen} />

        {/* SCREEN 1: INPUT */}
        {screen === "input" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3">Client Updates</h1>
              <p className="text-muted-foreground text-lg">
                Send offers, announcements, or quick updates to your clients in one click
              </p>
            </div>

            <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-100">
              <div className="space-y-6">
                <div>
                  <p className="text-base mb-4 text-gray-700">
                    What do you want to tell your clients?
                  </p>
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder='Example: "Website builds are 20% off this month"'
                    rows={4}
                    className="text-base resize-none border-gray-200 focus:border-primary"
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-3">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI will write a professional email for you
                  </p>
                </div>

                <Button 
                  onClick={generateEmail} 
                  className="w-full h-12 text-base"
                  disabled={isGenerating || !userInput.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: REVIEW - Gmail Style */}
        {screen === "review" && (
          <div className="space-y-6">
            <button 
              onClick={() => setScreen("input")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3">Review Your Email</h1>
              <p className="text-muted-foreground">
                Make any changes before choosing recipients
              </p>
            </div>

            {/* Gmail-style Email Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Email Header */}
              <div className="border-b border-gray-200 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    {isEditingSubject ? (
                      <Input
                        value={generatedEmail.subject}
                        onChange={(e) => setGeneratedEmail({ ...generatedEmail, subject: e.target.value })}
                        onBlur={() => setIsEditingSubject(false)}
                        autoFocus
                        className="text-xl font-semibold border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0"
                      />
                    ) : (
                      <h2 
                        onClick={() => setIsEditingSubject(true)}
                        className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
                      >
                        {generatedEmail.subject}
                      </h2>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={regenerateEmail}
                    disabled={isGenerating}
                    className="text-muted-foreground"
                  >
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">From:</span>
                  <span>{user?.name || "You"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">To:</span>
                  <span>Your clients</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="p-6">
                {isEditingBody ? (
                  <Textarea
                    value={generatedEmail.body}
                    onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                    onBlur={() => setIsEditingBody(false)}
                    rows={14}
                    className="text-base font-sans border-gray-200 w-full"
                    autoFocus
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditingBody(true)}
                    className="text-base whitespace-pre-wrap cursor-pointer hover:bg-gray-50 p-4 rounded transition-colors min-h-[300px]"
                  >
                    {generatedEmail.body}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4 italic">
                  {`{{client_name}}`} will be replaced with each client's name
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => setScreen("recipients")}
                size="lg"
                className="px-8"
              >
                Looks good
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* SCREEN 3: RECIPIENTS */}
        {screen === "recipients" && (
          <div className="space-y-6 pb-24">
            <button 
              onClick={() => setScreen("review")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-3">Choose Recipients</h1>
              <p className="text-muted-foreground">
                Select who should receive this update
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              <div className="space-y-6">
                {/* Send Scope */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="scope"
                      checked={sendScope === "all"}
                      onChange={() => setSendScope("all")}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-base group-hover:text-primary transition-colors">
                      All clients
                      {!hasClientUpdatesAccess && (
                        <span className="ml-2 text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">Pro</span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="scope"
                      checked={sendScope === "selected"}
                      onChange={() => setSendScope("selected")}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-base group-hover:text-primary transition-colors">Choose clients</span>
                  </label>
                </div>

                {/* Client Selection - Only show if "Choose clients" selected */}
                {sendScope === "selected" && (
                  <div className="space-y-4 pt-4 border-t">
                    {clients.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No clients yet</p>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingClient(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add your first client
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-muted-foreground">
                            {selectedClients.length} of {clients.length} selected
                          </p>
                          <button
                            onClick={() => setIsAddingClient(true)}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add client
                          </button>
                        </div>

                        {/* Inline Add Client Form */}
                        {isAddingClient && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 mb-4">
                            <div className="flex gap-3">
                              <Input
                                placeholder="Client name"
                                value={newClient.name}
                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                className="flex-1 bg-white"
                              />
                              <Input
                                placeholder="Email"
                                type="email"
                                value={newClient.email}
                                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                className="flex-1 bg-white"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleAddClient}
                                size="sm"
                                className="flex-1"
                              >
                                Add & Select
                              </Button>
                              <Button 
                                onClick={() => {
                                  setIsAddingClient(false);
                                  setNewClient({ name: "", email: "" });
                                }}
                                variant="ghost"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Simple Client List */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {clients.map((client) => (
                            <label
                              key={client.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={selectedClients.includes(client.id)}
                                onChange={() => toggleClientSelection(client.id)}
                                className="w-4 h-4 text-primary"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
              <div className="container mx-auto max-w-3xl py-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    Sending to <span className="font-semibold">{recipientCount}</span> {recipientCount === 1 ? "client" : "clients"}
                  </div>
                  <Button 
                    onClick={handleSendUpdate}
                    disabled={recipientCount === 0}
                    size="lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientUpdates;