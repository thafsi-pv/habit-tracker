import { CreateGroupResult, SendMessageResult, WhatsAppProvider, WhatsAppStatus } from './whatsapp-provider.interface';
export declare class WhatsAppService {
    private provider;
    constructor(provider: WhatsAppProvider);
    connect(userId: string): Promise<void>;
    disconnect(userId: string): Promise<void>;
    getStatus(userId: string): Promise<WhatsAppStatus>;
    sendToUser(userId: string, message: string): Promise<SendMessageResult>;
    sendToNumber(senderUserId: string, recipientNumber: string, message: string): Promise<SendMessageResult>;
    sendImageToNumber(senderUserId: string, recipientNumber: string, image: Buffer, caption?: string): Promise<SendMessageResult>;
    sendToGroup(senderUserId: string, groupJid: string, message: string): Promise<SendMessageResult>;
    sendImageToGroup(senderUserId: string, groupJid: string, image: Buffer, caption?: string): Promise<SendMessageResult>;
    createGroup(senderUserId: string, groupName: string, participantNumbers: string[]): Promise<CreateGroupResult>;
    addParticipantsToGroup(senderUserId: string, groupJid: string, participantNumbers: string[]): Promise<SendMessageResult>;
    removeParticipantsFromGroup(senderUserId: string, groupJid: string, participantNumbers: string[]): Promise<SendMessageResult>;
}
