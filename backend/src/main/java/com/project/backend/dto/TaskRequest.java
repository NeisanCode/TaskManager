package com.project.backend.dto;

import com.project.backend.entity.TaskPriority;
import com.project.backend.entity.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TaskRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 100, message = "Le titre ne doit pas dépasser 100 caractères")
    private String title;

    @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères")
    private String description;

    @NotNull(message = "Le statut est obligatoire")
    private TaskStatus status;

    @NotNull(message = "La priorité est obligatoire")
    private TaskPriority priority;

    public TaskRequest() {
    }

    public TaskRequest(String title, String description, TaskStatus status, TaskPriority priority) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

}