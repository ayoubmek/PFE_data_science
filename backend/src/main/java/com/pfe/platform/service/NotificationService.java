package com.pfe.platform.service;

import com.pfe.platform.entity.Notification;
import com.pfe.platform.entity.StockItem;
import com.pfe.platform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository repo;

    public List<Notification> getAll() {
        return repo.findByLuFalseOrderByCreatedAtDesc();
    }

    public long countUnread() {
        return repo.countByLuFalse();
    }

    public void markAsRead(Long id) {
        repo.markAsRead(id);
    }

    public void markAllAsRead() {
        repo.markAllAsRead();
    }

    public void createStockAlert(StockItem item, String niveau) {
        Notification.Priorite priorite = switch (niveau) {
            case "RUPTURE" -> Notification.Priorite.CRITIQUE;
            case "CRITIQUE" -> Notification.Priorite.HAUTE;
            default -> Notification.Priorite.NORMALE;
        };

        String titre = switch (niveau) {
            case "RUPTURE" -> "🚨 Rupture de stock: " + item.getReference();
            case "CRITIQUE" -> "⚠️ Niveau critique: " + item.getReference();
            default -> "📉 Alerte stock: " + item.getReference();
        };

        String message = String.format(
            "L'article [%s] %s a atteint le niveau %s. Quantité actuelle: %d | Seuil: %d",
            item.getReference(), item.getDesignation(), niveau,
            item.getQuantite(), item.getSeuilCritique()
        );

        Notification notif = Notification.builder()
            .titre(titre)
            .message(message)
            .type(Notification.Type.ALERTE_STOCK)
            .priorite(priorite)
            .module("STOCK")
            .entityId(item.getReference())
            .build();

        repo.save(notif);
    }

    public void createProductionAlert(String titre, String message) {
        Notification notif = Notification.builder()
            .titre(titre)
            .message(message)
            .type(Notification.Type.ALERTE_PRODUCTION)
            .priorite(Notification.Priorite.HAUTE)
            .module("PRODUCTION")
            .build();
        repo.save(notif);
    }

    public void create(String titre, String message, Notification.Type type, Notification.Priorite priorite) {
        Notification notif = Notification.builder()
            .titre(titre)
            .message(message)
            .type(type)
            .priorite(priorite)
            .build();
        repo.save(notif);
    }
}
