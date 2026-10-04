package com.project.backend.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.backend.entity.Task;
import com.project.backend.entity.TaskPriority;
import com.project.backend.entity.TaskStatus;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t WHERE "
            + "LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) AND "
            + "(:status IS NULL OR t.status = :status) AND "
            + "(:priority IS NULL OR t.priority = :priority)")
    List<Task> findAllFiltered(@Param("search") String search,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            Sort sort);

}