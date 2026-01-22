
import React from "react";
import { Navigate } from "react-router-dom";

const PaymentSettings: React.FC = () => {
  // This component is no longer used, redirect to account settings
  return <Navigate to="/settings/account" replace />;
};

export default PaymentSettings;
