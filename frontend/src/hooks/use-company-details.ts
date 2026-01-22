// Stub company details hook - for standalone frontend
// TODO: Implement with real backend

import { useState } from 'react';

export interface CompanyDetails {
    id?: string;
    user_id?: string;
    company_name?: string;
    owner_name?: string;
    email?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    tax_id?: string;
    logo_url?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    routing_number?: string;
    swift_code?: string;
    paypal_email?: string;
    razorpay_id?: string;
}

export const useCompanyDetails = () => {
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchCompanyDetails = async () => {
        console.log('fetchCompanyDetails stub called');
        setLoading(false);
        return null;
    };

    const saveCompanyDetails = async (details: Partial<CompanyDetails>): Promise<boolean> => {
        console.log('saveCompanyDetails stub called', details);
        return true;
    };

    return {
        companyDetails,
        loading,
        fetchCompanyDetails,
        saveCompanyDetails,
        refetch: fetchCompanyDetails,
    };
};
