package com.pfe.platform.service;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.entity.Machine;
import com.pfe.platform.entity.ProductionOrder;
import com.pfe.platform.repository.FactCleRepository;
import com.pfe.platform.repository.MachineRepository;
import com.pfe.platform.repository.ProductionOrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionService {

    private final ProductionOrderRepository orderRepo;
    private final MachineRepository machineRepo;
    private final FactCleRepository factCleRepo;

    public List<ProductionDTO.Response> getAllOrders() {
        try {
            List<Object[]> factRows = factCleRepo.findProductionOrdersFromFactCle();
            if (factRows != null && !factRows.isEmpty()) {
                List<ProductionDTO.Response> list = new java.util.ArrayList<>();
                long idCounter = 1;
                for (Object[] r : factRows) {
                    try {
                        ProductionDTO.Response res = new ProductionDTO.Response();
                        res.setId(idCounter++);
                        res.setReference(r[0] != null ? r[0].toString().trim() : "OF-NAV-" + idCounter);
                        res.setArticle(r[1] != null && !r[1].toString().isBlank() ? r[1].toString().trim() : "Article de Production");
                        int prod = r[3] != null ? ((Number) r[3]).intValue() : 0;
                        int obj = r[2] != null ? ((Number) r[2]).intValue() : Math.max(100, (int)(prod * 1.1));
                        res.setQuantitePrevue(Math.max(obj, prod));
                        res.setQuantiteRealisee(prod);
                        try {
                            String stStr = r[4] != null ? r[4].toString() : (prod > 0 ? "TERMINE" : "EN_COURS");
                            res.setStatut(ProductionOrder.Statut.valueOf(stStr));
                        } catch (Exception ex) {
                            res.setStatut(ProductionOrder.Statut.TERMINE);
                        }
                        if (r[4] != null) {
                            try {
                                if (r[4] instanceof java.sql.Date) {
                                    res.setDateDebut(((java.sql.Date) r[4]).toLocalDate());
                                } else if (r[4] instanceof java.sql.Timestamp) {
                                    res.setDateDebut(((java.sql.Timestamp) r[4]).toLocalDateTime().toLocalDate());
                                } else {
                                    res.setDateDebut(java.time.LocalDate.parse(r[4].toString().substring(0, 10)));
                                }
                            } catch (Exception ex) {
                                res.setDateDebut(java.time.LocalDate.now());
                            }
                        } else {
                            res.setDateDebut(java.time.LocalDate.now());
                        }
                        res.setMachineNom(r[5] != null ? r[5].toString().trim() : "Poste Principal");
                        res.setResponsable(r[6] != null ? r[6].toString().trim() : "Superviseur");
                        double yield = obj > 0 ? Math.round((double) prod / obj * 1000.0) / 10.0 : 100.0;
                        res.setTauxRendement(yield);
                        list.add(res);
                    } catch (Exception rowErr) {
                        // Skip malformed row safely
                    }
                }
                if (!list.isEmpty()) {
                    return list;
                }
            }
        } catch (Exception e) {
            // Fallback to local table if FACT_CLE query fails
        }
        return orderRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductionDTO.Response getOrderById(Long id) {
        return toResponse(findOrderOrThrow(id));
    }

    public ProductionDTO.Response createOrder(ProductionDTO.Request req) {
        ProductionOrder order = new ProductionOrder();
        mapRequestToEntity(req, order);
        return toResponse(orderRepo.save(order));
    }

    public ProductionDTO.Response updateOrder(Long id, ProductionDTO.Request req) {
        ProductionOrder order = findOrderOrThrow(id);
        mapRequestToEntity(req, order);
        return toResponse(orderRepo.save(order));
    }

    public void deleteOrder(Long id) {
        findOrderOrThrow(id);
        orderRepo.deleteById(id);
    }

    public ProductionDTO.KpiResponse getKpi() {
        ProductionDTO.KpiResponse kpi = new ProductionDTO.KpiResponse();
        java.util.List<Object[]> rows = factCleRepo.findKpiStats();
        if (!rows.isEmpty()) {
            Object[] r = rows.get(0);
            long totalDocs   = r[0] != null ? ((Number) r[0]).longValue() : 0;
            long totalOps    = r[1] != null ? ((Number) r[1]).longValue() : 0;
            double output    = r[2] != null ? ((Number) r[2]).doubleValue() : 0;
            double scrap     = r[3] != null ? ((Number) r[3]).doubleValue() : 0;
            long workCenters = r[5] != null ? ((Number) r[5]).longValue() : 0;
            long items       = r[6] != null ? ((Number) r[6]).longValue() : 0;
            double efficiency = (output + scrap) > 0
                ? Math.round(output / (output + scrap) * 1000.0) / 10.0 : 100.0;
            kpi.setTotalOrdres(totalDocs);
            kpi.setEnCours(items);
            kpi.setTermines(totalOps);
            kpi.setEnRetard(0);
            kpi.setEnAttente(0);
            kpi.setTauxRendementMoyen(efficiency);
            kpi.setMachinesDisponibles(workCenters);
            kpi.setMachinesEnPanne(0);
        }
        return kpi;
    }

    public List<ProductionDTO.Response> getRetardes() {
        return orderRepo.findRetardes(LocalDate.now()).stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ProductionOrder findOrderOrThrow(Long id) {
        return orderRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ordre de production non trouvé: " + id));
    }

    private void mapRequestToEntity(ProductionDTO.Request req, ProductionOrder order) {
        order.setReference(req.getReference());
        order.setArticle(req.getArticle());
        order.setQuantitePrevue(req.getQuantitePrevue());
        if (req.getQuantiteRealisee() != null) order.setQuantiteRealisee(req.getQuantiteRealisee());
        if (req.getStatut() != null) order.setStatut(req.getStatut());
        order.setDateDebut(req.getDateDebut());
        order.setDateFin(req.getDateFin());
        order.setResponsable(req.getResponsable());
        order.setNotes(req.getNotes());
        if (req.getMachineId() != null) {
            Machine machine = machineRepo.findById(req.getMachineId())
                .orElseThrow(() -> new EntityNotFoundException("Machine non trouvée: " + req.getMachineId()));
            order.setMachine(machine);
        }
    }

    private ProductionDTO.Response toResponse(ProductionOrder o) {
        ProductionDTO.Response r = new ProductionDTO.Response();
        r.setId(o.getId());
        r.setReference(o.getReference());
        r.setArticle(o.getArticle());
        r.setQuantitePrevue(o.getQuantitePrevue());
        r.setQuantiteRealisee(o.getQuantiteRealisee());
        r.setStatut(o.getStatut());
        r.setDateDebut(o.getDateDebut());
        r.setDateFin(o.getDateFin());
        r.setResponsable(o.getResponsable());
        r.setNotes(o.getNotes());
        r.setTauxRendement(o.getTauxRendement());
        r.setCreatedAt(o.getCreatedAt());
        r.setUpdatedAt(o.getUpdatedAt());
        if (o.getMachine() != null) {
            r.setMachineId(o.getMachine().getId());
            r.setMachineNom(o.getMachine().getNom());
        }
        return r;
    }
}
