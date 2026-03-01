package com.web.chat.app.chat.controller;

import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.web.chat.app.chat.domain.Message;
import com.web.chat.app.chat.domain.MessageType;
import com.web.chat.app.chat.service.ChatService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Slf4j
@Component
@AllArgsConstructor
public class WebSocketListener {
   private final SimpMessageSendingOperations simpMessageSendingOperations;
   private final ChatService chatService;

   @EventListener
   public void handleWebSocketListener(final SessionConnectEvent sessionConnectEvent) {
      log.info("New User connected to websocket");
   }

   @EventListener
   public void handleWebSocketDisconnectListener(final SessionDisconnectEvent sessionDisconnectEvent) {
      final StompHeaderAccessor stompHeaderAccessor = StompHeaderAccessor.wrap(sessionDisconnectEvent.getMessage());
      final String user = (String) stompHeaderAccessor.getSessionAttributes().get("user");

      if (user != null) {
         final Message message = Message.builder().type(MessageType.DISCONNECT).sender(user).build();
         log.info("Message: {}", message);
         simpMessageSendingOperations.convertAndSend("/topic/public", message);
         chatService.removeUserAndBroadcast(user);
      }
   }
}
