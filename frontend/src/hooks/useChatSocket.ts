import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessageDto } from '../types';

interface UseChatSocketOptions {
    currentUser: string | null;
    onPrivateMessage: (msg: ChatMessageDto) => void;
    onGroupMessage: (msg: ChatMessageDto) => void;
}

export function useChatSocket({ currentUser, onPrivateMessage, onGroupMessage }: UseChatSocketOptions) {
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('/chat'),
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                setError(null);

                // Group / public topic
                stompClient.subscribe('/topic/public', (frame) => {
                    try {
                        const msg: ChatMessageDto = JSON.parse(frame.body);
                        onGroupMessage(msg);
                    } catch { /* ignore */ }
                });

                // Private messages queue
                stompClient.subscribe('/user/queue/messages', (frame) => {
                    try {
                        const msg: ChatMessageDto = JSON.parse(frame.body);
                        onPrivateMessage(msg);
                    } catch { /* ignore */ }
                });
            },
            onStompError: (frame) => {
                setError(`Connection error: ${frame.headers?.message ?? 'unknown'}`);
                setIsConnected(false);
            },
            onDisconnect: () => setIsConnected(false),
        });

        stompClient.activate();
        clientRef.current = stompClient;

        return () => {
            stompClient.deactivate();
            setIsConnected(false);
        };
    }, [currentUser, onGroupMessage, onPrivateMessage]);

    const sendPrivateMessage = useCallback((msg: ChatMessageDto) => {
        clientRef.current?.publish({
            destination: '/app/private-message',
            body: JSON.stringify(msg),
        });
    }, []);

    const sendGroupMessage = useCallback((msg: ChatMessageDto) => {
        clientRef.current?.publish({
            destination: '/app/room-message',
            body: JSON.stringify(msg),
        });
    }, []);

    return { isConnected, error, sendPrivateMessage, sendGroupMessage };
}
