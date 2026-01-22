import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Receipt,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { Invoice } from "@/types";
import { createInvoice } from "@/services/invoiceService";
import toast from "react-hot-toast";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

interface InvoiceFormProps {
  workspaceId: string;
  clientName?: string;
  onInvoiceCreated: (invoice: Invoice) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  workspaceId,
  clientName = "",
  onInvoiceCreated,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: clientName,
    amount: 0,
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 7 days from now
    taxPercentage: 0,
    paypalEmail: "",
    currency: "USD",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "amount" || id === "taxPercentage" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, currency: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || formData.amount <= 0) {
      toast.error("Please fill in client name and amount");
      return;
    }

    setLoading(true);
    try {
      const invoice = await createInvoice({
        ...formData,
        workspaceId,
        status: "Pending",
      });
      onInvoiceCreated(invoice);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.amount;
    const tax = (subtotal * formData.taxPercentage) / 100;
    return (subtotal + tax).toFixed(2);
  };

  const getCurrencySymbol = () => {
    return CURRENCIES.find(c => c.code === formData.currency)?.symbol || "$";
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <Receipt className="h-5 w-5" />
          <CardTitle className="text-xl">Create New Invoice</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to generate a new invoice for this workspace.
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="px-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Client Name
                </Label>
                <Input
                  id="clientName"
                  placeholder="Acme Corp"
                  value={formData.clientName}
                  onChange={handleChange}
                  className="rounded-xl border-gray-200 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypalEmail" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  PayPal Email (Optional)
                </Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="billing@acme.com"
                  value={formData.paypalEmail}
                  onChange={handleChange}
                  className="rounded-xl border-gray-200 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Invoice Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="rounded-xl border-gray-200 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="rounded-xl border-gray-200 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Description / Notes
            </Label>
            <Textarea
              id="description"
              placeholder="Project development, consultation services, etc."
              value={formData.description}
              onChange={handleChange}
              className="min-h-[100px] rounded-xl border-gray-200 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{getCurrencySymbol()}</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount || ""}
                    onChange={handleChange}
                    className="pl-8 rounded-xl border-gray-200 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="w-full md:w-36 space-y-2">
                <Label className="text-sm font-semibold">Currency</Label>
                <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="rounded-xl border-gray-200 bg-white">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-32 space-y-2">
                <Label htmlFor="taxPercentage" className="text-sm font-semibold">Tax (%)</Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  placeholder="0"
                  value={formData.taxPercentage || ""}
                  onChange={handleChange}
                  className="rounded-xl border-gray-200 bg-white"
                />
              </div>

              <div className="flex-none text-right min-w-[120px]">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{getCurrencySymbol()}{calculateTotal()}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-0 pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="rounded-full px-6"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? "Creating..." : "Generate Invoice"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default InvoiceForm;
