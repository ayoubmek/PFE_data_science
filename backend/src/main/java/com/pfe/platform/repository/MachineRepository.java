package com.pfe.platform.repository;

import com.pfe.platform.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
    Optional<Machine> findByCode(String code);
    List<Machine> findByStatut(Machine.Statut statut);
}