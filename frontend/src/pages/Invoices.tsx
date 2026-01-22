import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Calendar,
  Building2
} from "lucide-react";
import { fetchAllInvoices, InvoiceWithWorkspace } from "@/services/invoiceService";

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceWithWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const data = await fetchAllInvoices();
        setInvoices(data);
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-50 font-medium px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-50 font-medium px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-50 font-medium px-3 py-1">
            <AlertCircle className="h-3 w-3 mr-1.5" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-50 font-medium px-3 py-1">
            {status}
          </Badge>
        );
    }
  };

  // Calculate summary stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const paidCount = invoices.filter((inv) => inv.status === "Paid").length;
  const pendingCount = invoices.filter((inv) => inv.status === "Pending").length;

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "all") return true;
    if (filter === "paid") return inv.status === "Paid";
    if (filter === "pending") return inv.status === "Pending";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        <FadeIn>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Invoices
              </h1>
            </div>
            <p className="text-gray-500 ml-[52px]">
              View and manage all your invoices across workspaces
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <FadeIn delay="50">
              <Card className="relative overflow-hidden bg-white border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="pt-6 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Invoiced</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{formatAmount(totalAmount)}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>{invoices.length} invoices</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay="100">
              <Card className="relative overflow-hidden bg-white border-0 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="pt-6 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Paid</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{formatAmount(paidAmount)}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-emerald-500">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{paidCount} paid</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay="150">
              <Card className="relative overflow-hidden bg-white border-0 shadow-lg shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="pt-6 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Pending</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{formatAmount(pendingAmount)}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-amber-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{pendingCount} awaiting</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Invoices List */}
          <FadeIn delay="200">
            <Card className="border-0 shadow-xl shadow-gray-200/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    All Invoices
                  </CardTitle>
                  <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
                    <TabsList className="grid grid-cols-3 h-9 bg-gray-100/80">
                      <TabsTrigger value="all" className="text-xs px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        All ({invoices.length})
                      </TabsTrigger>
                      <TabsTrigger value="paid" className="text-xs px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Paid ({paidCount})
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="text-xs px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Pending ({pendingCount})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-gray-400 text-sm">Loading invoices...</p>
                    </div>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Receipt className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {filter === "all" ? "No invoices yet" : `No ${filter} invoices`}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                      {filter === "all"
                        ? "Create invoices from your workspace invoice tab to see them here."
                        : `You don't have any ${filter} invoices at the moment.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredInvoices.map((invoice, index) => (
                      <div
                        key={invoice.id}
                        className="group flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 cursor-pointer"
                        onClick={() => navigate(`/workspace/${invoice.workspaceId}?tab=invoices`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${invoice.status === "Paid"
                              ? "bg-gradient-to-br from-emerald-100 to-green-50 group-hover:from-emerald-200 group-hover:to-green-100"
                              : "bg-gradient-to-br from-blue-100 to-indigo-50 group-hover:from-blue-200 group-hover:to-indigo-100"
                            }`}>
                            <Receipt className={`h-5 w-5 ${invoice.status === "Paid" ? "text-emerald-600" : "text-blue-600"
                              }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-gray-400" />
                              <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {invoice.workspaceName}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400 font-mono">
                                INV-{invoice.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due {formatDate(invoice.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">{formatAmount(invoice.amount)}</p>
                            <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </FadeIn>
      </main>
    </div>
  );
};

export default Invoices;
