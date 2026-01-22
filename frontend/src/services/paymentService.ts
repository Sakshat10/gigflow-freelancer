// Stub payment service - for standalone frontend
// TODO: Implement with real backend

export const recordPayment = async (
    invoiceId: string,
    amount: number,
    paymentMethod: string
): Promise<any> => {
    console.log('recordPayment stub called');
    return {
        id: 'stub-payment-' + Date.now(),
        invoiceId,
        amount,
        paymentMethod,
        status: 'completed',
        created_at: new Date().toISOString(),
    };
};

export const updateInvoicePaymentStatus = async (
    invoiceId: string,
    status: string
): Promise<any> => {
    console.log('updateInvoicePaymentStatus stub called');
    return {
        id: invoiceId,
        status,
    };
};
