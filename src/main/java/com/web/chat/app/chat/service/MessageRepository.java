package com.web.chat.app.chat.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.chat.app.chat.domain.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

        List<Message> findBySender(String sender);

        @Query("""
                        SELECT m FROM Message m
                        WHERE (m.sender = :user1 AND m.recipientTo = :user2)
                           OR (m.sender = :user2 AND m.recipientTo = :user1)
                        ORDER BY m.id ASC
                        """)
        List<Message> findPrivateConversation(@Param("user1") String user1,
                        @Param("user2") String user2);

        Slice<Message> findAllByOrderByTimeStampDesc(Pageable pageable);

        @Query("SELECT m FROM Message m WHERE " +
                        "(m.sender = :user1 AND m.recipientTo = :user2) OR " +
                        "(m.sender = :user2 AND m.recipientTo = :user1) " +
                        "ORDER BY m.timeStamp DESC")
        Slice<Message> findPrivateHistory(@Param("user1") String user1,
                        @Param("user2") String user2,
                        Pageable pageable);
}
