package com.web.chat.app.authentication.registration.repo;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.web.chat.app.authentication.registration.domain.ConfirmationToken;

@Repository
public interface ConfirmationTokenRepo extends JpaRepository<ConfirmationToken, Long> {
    @Query("SELECT t FROM ConfirmationToken t WHERE t.token = :token")
   Optional<ConfirmationToken> findByToken(@Param("token") String token);
   
}
