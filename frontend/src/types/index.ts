export interface ChatMessageDto {
    id?: number;
    sender?: string;
    from?: string;
    recipientTo?: string;
    content?: string;
    message?: string;
    type: string;
    status?: 'SENT' | 'DELIVERED' | 'READ';
    timeStamp?: string;
    timestamp?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
}

export interface ChatUserResponse {
    nickname: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
}

export interface ConversationEntry {
    user: ChatUserResponse;
    lastMessage?: ChatMessageDto;
    unread?: number;
}

export interface ActiveChat {
  mode: 'group' | 'private';
  user?: ChatUserResponse;
}
