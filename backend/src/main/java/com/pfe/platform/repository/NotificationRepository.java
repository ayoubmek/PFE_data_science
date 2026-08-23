package com.pfe.platform.repository;

import com.pfe.platform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUsernameOrUsernameIsNullOrderByCreatedAtDesc(String username);

    List<Notification> findByLuFalseOrderByCreatedAtDesc();

    long countByLuFalse();

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.lu = true WHERE n.lu = false")
    int markAllAsRead();

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.lu = true WHERE n.id = :id")
    int markAsRead(Long id);
}