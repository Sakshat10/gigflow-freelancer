// Stub message service - for standalone frontend
// TODO: Implement with real backend

import { Message } from '@/types';

export const fetchMessages = async (workspaceId: string): Promise<Message[]> => {
    console.log('fetchMessages stub called');
    return [];
};

export const sendMessage = async (
    workspaceId: string,
    sender: 'me' | 'client',
    content: string,
    file?: File
): Promise<Message> => {
    console.log('sendMessage stub called');
    return {
        id: 'stub-msg-' + Date.now(),
        sender,
        content,
        timestamp: new Date().toLocaleTimeString(),
        hasAttachment: !!file,
    };
};

export const sendAudioMessage = async (
    workspaceId: string,
    sender: 'me' | 'client',
    audioBlob: Blob
): Promise<Message> => {
    console.log('sendAudioMessage stub called');
    return {
        id: 'stub-audio-' + Date.now(),
        sender,
        content: '',
        timestamp: new Date().toLocaleTimeString(),
        hasAttachment: true,
        attachmentType: 'audio/webm',
    };
};

export const downloadAttachment = (url: string, filename: string): void => {
    console.log('downloadAttachment stub called');
    window.open(url, '_blank');
};
