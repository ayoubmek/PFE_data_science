package com.pfe.platform.config;

import com.pfe.platform.entity.*;
import com.pfe.platform.repository.*;
import com.pfe.platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final MachineRepository machineRepo;
    private final ProductionOrderRepository productionRepo;
    private final StockItemRepository stockRepo;
    private final StockMovementRepository movementRepo;
    private final NotificationRepository notificationRepo;
    private final NotificationService notificationService;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() == 0) {
            log.info("Seeding users...");
            seedUsers();
        }
        if (machineRepo.count() == 0) {
            log.info("Seeding machines...");
            seedMachines();
        }
        if (productionRepo.count() == 0) {
            log.info("Seeding production orders...");
            seedProductionOrders();
        }

        if (movementRepo.count() == 0) {
            log.info("Seeding stock movements...");
            seedStockMovements();
            log.info("Stock movements seeded.");
        }

        if (notificationRepo.count() == 0) {
            log.info("Syncing dynamic DWH alerts for notifications...");
            notificationService.syncDynamicDwhAlerts();
            log.info("DWH notifications synced.");
        }
    }

    private void seedUsers() {
        userRepo.save(User.builder()
            .username("admin").password(passwordEncoder.encode("admin123"))
            .fullName("Administrateur Système").email("admin@pfe.com")
            .role(User.Role.ADMIN).build());
        userRepo.save(User.builder()
            .username("manager").password(passwordEncoder.encode("manager123"))
            .fullName("Chef de Production").email("manager@pfe.com")
            .role(User.Role.MANAGER).build());
        userRepo.save(User.builder()
            .username("operateur").password(passwordEncoder.encode("operateur123"))
            .fullName("Opérateur Atelier").email("operateur@pfe.com")
            .role(User.Role.OPERATEUR).build());
    }

    private void seedMachines() {
        machineRepo.save(Machine.builder().code("MCH-001").nom("Presse Hydraulique A").type("Presse")
            .emplacement("Atelier 1").statut(Machine.Statut.EN_PRODUCTION).tauxRendement(92.5).build());
        machineRepo.save(Machine.builder().code("MCH-002").nom("Tour CNC B-200").type("Tour CNC")
            .emplacement("Atelier 2").statut(Machine.Statut.DISPONIBLE).tauxRendement(98.0).build());
        machineRepo.save(Machine.builder().code("MCH-003").nom("Fraiseuse C-500").type("Fraiseuse")
            .emplacement("Atelier 1").statut(Machine.Statut.EN_MAINTENANCE).tauxRendement(0.0).build());
        machineRepo.save(Machine.builder().code("MCH-004").nom("Robot Soudure D1").type("Soudure")
            .emplacement("Atelier 3").statut(Machine.Statut.EN_PRODUCTION).tauxRendement(87.3).build());
        machineRepo.save(Machine.builder().code("MCH-005").nom("Convoyeur E10").type("Convoyeur")
            .emplacement("Entrepôt").statut(Machine.Statut.DISPONIBLE).tauxRendement(100.0).build());
    }

    private void seedProductionOrders() {
        var machines = machineRepo.findAll();
        productionRepo.save(ProductionOrder.builder().reference("OF-2024-001")
            .article("Pièce Aluminium AA-100").quantitePrevue(500).quantiteRealisee(480)
            .statut(ProductionOrder.Statut.TERMINE).dateDebut(LocalDate.now().minusDays(10))
            .dateFin(LocalDate.now().minusDays(3)).machine(machines.get(0)).responsable("manager").build());
        productionRepo.save(ProductionOrder.builder().reference("OF-2024-002")
            .article("Carter Acier CS-200").quantitePrevue(300).quantiteRealisee(150)
            .statut(ProductionOrder.Statut.EN_COURS).dateDebut(LocalDate.now().minusDays(5))
            .dateFin(LocalDate.now().plusDays(5)).machine(machines.get(1)).responsable("manager").build());
        productionRepo.save(ProductionOrder.builder().reference("OF-2024-003")
            .article("Axe Inox AX-50").quantitePrevue(200).quantiteRealisee(0)
            .statut(ProductionOrder.Statut.EN_ATTENTE).dateDebut(LocalDate.now().plusDays(2))
            .dateFin(LocalDate.now().plusDays(10)).responsable("manager").build());
        productionRepo.save(ProductionOrder.builder().reference("OF-2024-004")
            .article("Roulement Billes RB-30").quantitePrevue(1000).quantiteRealisee(200)
            .statut(ProductionOrder.Statut.EN_RETARD).dateDebut(LocalDate.now().minusDays(15))
            .dateFin(LocalDate.now().minusDays(2)).machine(machines.get(3)).responsable("operateur").build());
        productionRepo.save(ProductionOrder.builder().reference("OF-2024-005")
            .article("Bride Fonte BF-80").quantitePrevue(150).quantiteRealisee(150)
            .statut(ProductionOrder.Statut.TERMINE).dateDebut(LocalDate.now().minusDays(20))
            .dateFin(LocalDate.now().minusDays(15)).machine(machines.get(0)).responsable("manager").build());
    }

    private void seedStockMovements() {
        var items = stockRepo.findAllLatestSnapshot();
        if (items.isEmpty()) return;

        String[] operators = {"admin", "manager", "operateur"};
        String[] motifs = {"Réception fournisseur", "Livraison client", "Ajustement inventaire",
                           "Retour client", "Transfert interne", "Correction écart"};
        StockMovement.TypeMouvement[] types = StockMovement.TypeMouvement.values();

        for (int i = 0; i < Math.min(30, items.size()); i++) {
            var item = items.get(i);
            StockMovement.TypeMouvement type = types[i % types.length];
            movementRepo.save(StockMovement.builder()
                .stockItemReference(item.getReference())
                .stockItemNo(item.getReference())
                .type(type)
                .quantite(BigDecimal.valueOf(10 + (i * 7) % 200))
                .motif(motifs[i % motifs.length])
                .operateur(operators[i % operators.length])
                .reference("BON-" + String.format("%04d", i + 1))
                .date(LocalDateTime.now().minusDays(i % 14).minusHours(i % 8))
                .build());
        }
    }

    private void seedStockItems() {
        stockRepo.save(StockItem.builder().reference("MAT-001").designation("Aluminium EN AW-6061")
            .categorie("Matière Première").emplacement("Rack A-01").unite("kg")
            .quantite(new BigDecimal("850")).seuilCritique(new BigDecimal("50")).seuilAlerte(new BigDecimal("100"))
            .valeurUnitaire(new BigDecimal("4.50")).build());
        stockRepo.save(StockItem.builder().reference("MAT-002").designation("Acier Inoxydable 316L")
            .categorie("Matière Première").emplacement("Rack A-02").unite("kg")
            .quantite(new BigDecimal("15")).seuilCritique(new BigDecimal("20")).seuilAlerte(new BigDecimal("50"))
            .valeurUnitaire(new BigDecimal("8.20")).build());
        stockRepo.save(StockItem.builder().reference("MAT-003").designation("Cuivre C11000")
            .categorie("Matière Première").emplacement("Rack B-01").unite("kg")
            .quantite(BigDecimal.ZERO).seuilCritique(BigDecimal.TEN).seuilAlerte(new BigDecimal("30"))
            .valeurUnitaire(new BigDecimal("12.75")).build());
        stockRepo.save(StockItem.builder().reference("PRD-001").designation("Pièce Aluminium AA-100 (Finie)")
            .categorie("Produit Fini").emplacement("Zone PF-1").unite("pcs")
            .quantite(new BigDecimal("480")).seuilCritique(new BigDecimal("20")).seuilAlerte(new BigDecimal("50"))
            .valeurUnitaire(new BigDecimal("25.00")).build());
        stockRepo.save(StockItem.builder().reference("PRD-002").designation("Carter Acier CS-200 (Semi-Fini)")
            .categorie("En-Cours").emplacement("Zone EC-1").unite("pcs")
            .quantite(new BigDecimal("150")).seuilCritique(BigDecimal.TEN).seuilAlerte(new BigDecimal("30"))
            .valeurUnitaire(new BigDecimal("45.00")).build());
        stockRepo.save(StockItem.builder().reference("VIS-001").designation("Vis M8x25 Inox")
            .categorie("Visserie").emplacement("Rack C-01").unite("boîte")
            .quantite(new BigDecimal("8")).seuilCritique(new BigDecimal("5")).seuilAlerte(new BigDecimal("15"))
            .valeurUnitaire(new BigDecimal("3.20")).build());
        stockRepo.save(StockItem.builder().reference("LUB-001").designation("Huile de Coupe 5L")
            .categorie("Consommable").emplacement("Local Chimie").unite("bidon")
            .quantite(new BigDecimal("3")).seuilCritique(new BigDecimal("2")).seuilAlerte(new BigDecimal("5"))
            .valeurUnitaire(new BigDecimal("28.00")).build());
    }
}