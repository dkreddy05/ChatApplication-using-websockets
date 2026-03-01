package com.web.chat.app.authentication.chatuser.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;

@Repository

public interface ChatUserRepo extends JpaRepository<ChatUser, Long> {

    @Query("SELECT u FROM ChatUser u WHERE u.email = :email")
    Optional<ChatUser> findChatUserByEmail(@Param("email") String email);

    @Query("SELECT u FROM ChatUser u WHERE u.email = :email AND u.enabled = :enabled")
    ChatUser findChatUserByEmailAndEnabled(
            @Param("email") String email,
            @Param("enabled") Boolean enabled);

    @Query("SELECT u FROM ChatUser u WHERE u.nickname = :nickname")
    ChatUser findChatUserByNickname(@Param("nickname") String nickname);

    @Query("SELECT u FROM ChatUser u WHERE u.id = :id")
    ChatUser findChatUserById(@Param("id") Long id);

    List<ChatUser> findByNicknameContainingIgnoreCase(String query);
}
