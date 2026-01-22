// Stub email notifications hook - for standalone frontend
// TODO: Implement with real backend

export const useEmailNotifications = () => {
    const sendNotificationEmail = async (
        recipientEmail: string,
        recipientType: string,
        notificationType: string,
        data: any,
        options?: any
    ): Promise<boolean> => {
        console.log('sendNotificationEmail stub called');
        return true;
    };

    return {
        sendNotificationEmail,
    };
};
