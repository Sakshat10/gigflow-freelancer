
import React from "react";
import { useCompanyDetails } from "@/hooks/use-company-details";
import CompanyDetailsTab from "@/components/invoice/CompanyDetailsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CompanyDetailsPage: React.FC = () => {
  const { form, loading } = useCompanyDetails();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Manage your company details for invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading company details...</p>
            </div>
          ) : (
            <CompanyDetailsTab 
              form={form} 
              showSaveButton={false}
            />
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-gray-500">
        Note: Company details will be saved when you create an invoice.
      </p>
    </div>
  );
};

export default CompanyDetailsPage;
