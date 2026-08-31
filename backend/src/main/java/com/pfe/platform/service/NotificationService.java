package com.pfe.platform.service;

import com.pfe.platform.entity.Notification;
import com.pfe.platform.entity.StockItem;
import com.pfe.platform.repository.FactCleRepository;
import com.pfe.platform.repository.NotificationRepository;
import com.pfe.platform.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository repo;
    private final StockItemRepository stockItemRepo;
    private final FactCleRepository factCleRepo;

    public List<Notification> getAll() {
        List<Notification> list = repo.findByLuFalseOrderByCreatedAtDesc();
        if (list.isEmpty() || list.stream().anyMatch(n -> n.getTitre() != null && (n.getTitre().contains("OF-2026-001") || n.getTitre().contains("??")))) {
            repo.deleteAll();
            syncDynamicDwhAlerts();
            list = repo.findByLuFalseOrderByCreatedAtDesc();
        }
        return list;
    }

    public void syncDynamicDwhAlerts() {
        try {
            // 1. Dynamic low stock alerts from DWH
            List<StockItem> lowItems = stockItemRepo.findTopLowStockItems();
            for (StockItem item : lowItems) {
                String ref = item.getReference();
                if (ref != null && !ref.isBlank()) {
                    repo.save(Notification.builder()
                        .titre("Rupture de Stock : " + ref)
                        .message("L'article [" + ref + "] " + (item.getDesignation() != null ? item.getDesignation() : "Composant") + " est en stock critique (" + item.getQuantite() + " pcs, site: " + (item.getEmplacement() != null ? item.getEmplacement() : "Tunisie") + ").")
                        .type(Notification.Type.ALERTE_STOCK)
                        .priorite(Notification.Priorite.CRITIQUE)
                        .module("STOCK")
                        .entityId(ref)
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build());
                }
            }

            // 2. Dynamic production alerts from DWH
            List<Object[]> ofs = factCleRepo.findRecentAlertOfs();
            for (Object[] r : ofs) {
                String code = r[0] != null ? r[0].toString().trim() : "";
                String desc = r[1] != null ? r[1].toString().trim() : "Composant";
                int qty = r[2] != null ? ((Number) r[2]).intValue() : 0;
                String atelier = r[3] != null ? r[3].toString().trim() : "Atelier";
                if (!code.isBlank()) {
                    repo.save(Notification.builder()
                        .titre("Ordre Clôturé : " + code)
                        .message("L'ordre de fabrication " + code + " (" + desc + ") pour " + qty + " pièces a été complété avec succès à l'atelier " + atelier + ".")
                        .type(Notification.Type.SUCCES)
                        .priorite(Notification.Priorite.NORMALE)
                        .module("PRODUCTION")
                        .entityId(code)
                        .createdAt(LocalDateTime.now().minusHours(4))
                        .build());
                }
            }
        } catch (Exception ignored) {
        }
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
            case "RUPTURE" -> "Rupture de Stock : " + item.getReference();
            case "CRITIQUE" -> "Seuil Critique : " + item.getReference();
            default -> "Alerte Stock : " + item.getReference();
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