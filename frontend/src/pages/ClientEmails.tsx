import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Plus, Search, Send, Trash2, Edit, DollarSign, Briefcase, TrendingUp } from "lucide-react";
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

const ClientEmails: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    company: "",
    status: "prospect",
    notes: ""
  });
  const [emailData, setEmailData] = useState({
    subject: "",
    message: ""
  });

  // Check if user has access to this feature
  const hasAccess = hasFeatureAccess(user?.plan, "clientManagement");

  useEffect(() => {
    if (hasAccess) {
      loadClients();
    }
  }, [hasAccess]);

  const loadClients = () => {
    // Load from localStorage for now
    const stored = localStorage.getItem("clients");
    if (stored) {
      setClients(JSON.parse(stored));
    }
  };

  const saveClients = (updatedClients: Client[]) => {
    localStorage.setItem("clients", JSON.stringify(updatedClients));
    setClients(updatedClients);
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
      company: newClient.company,
      status: newClient.status as "active" | "inactive" | "prospect",
      notes: newClient.notes,
      totalProjects: 0,
      totalRevenue: 0,
      lastContact: new Date().toISOString()
    };

    saveClients([...clients, client]);
    setIsAddDialogOpen(false);
    setNewClient({ name: "", email: "", company: "", status: "prospect", notes: "" });
    toast.success("Client added successfully");
  };

  const handleDeleteClient = (id: string) => {
    saveClients(clients.filter(c => c.id !== id));
    toast.success("Client deleted");
  };

  const handleSendEmail = () => {
    if (!emailData.subject || !emailData.message) {
      toast.error("Subject and message are required");
      return;
    }

    if (selectedClients.length === 0) {
      toast.error("Please select at least one client");
      return;
    }

    // Simulate sending email
    toast.success(`Email sent to ${selectedClients.length} client(s)`);
    setIsEmailDialogOpen(false);
    setEmailData({ subject: "", message: "" });
    setSelectedClients([]);
  };

  const toggleClientSelection = (id: string) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0)
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 pt-24">
          <Card className="p-8 text-center">
            <Mail className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Pro Plus Feature</h2>
            <p className="text-gray-500 mb-4">
              Client management is only available for Pro Plus subscribers.
            </p>
            <Button onClick={() => window.location.href = "/settings?tab=pricing"}>
              Upgrade to Pro Plus
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your clients and send them personalized emails
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Across all clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedClients.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready to email
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={selectedClients.length === 0}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email ({selectedClients.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Email to Clients</DialogTitle>
                      <DialogDescription>
                        Compose an email to send to {selectedClients.length} selected client(s)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={emailData.subject}
                          onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                          placeholder="Email subject"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={emailData.message}
                          onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                          placeholder="Your message..."
                          rows={6}
                        />
                      </div>
                      <Button onClick={handleSendEmail} className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Add a new client to your database
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={newClient.name}
                          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                          placeholder="Client name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClient.email}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                          placeholder="client@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={newClient.company}
                          onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newClient.notes}
                          onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                          placeholder="Additional notes..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleAddClient} className="w-full">
                        Add Client
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              {filteredClients.length} client(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No clients found. Add your first client to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedClients.length === filteredClients.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClients(filteredClients.map(c => c.id));
                          } else {
                            setSelectedClients([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => toggleClientSelection(client.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.company || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          client.status === "active" ? "default" :
                          client.status === "inactive" ? "secondary" : "outline"
                        }>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.totalProjects || 0}</TableCell>
                      <TableCell>${(client.totalRevenue || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientEmails;