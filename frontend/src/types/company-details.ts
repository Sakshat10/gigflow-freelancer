
export interface CompanyDetails {
  id: string;
  user_id: string;
  company_name: string;
  company_address: string;
  company_phone: string | null;
  company_email: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string | null;
  paypal_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyDetailsInput {
  company_name: string;
  company_address: string;
  company_phone?: string | null;
  company_email: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code?: string | null;
  paypal_email?: string | null;
}
