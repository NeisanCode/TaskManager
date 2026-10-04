package com.project.backend.exception;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Long taskId) {
        super("Tâche introuvable avec l'id " + taskId);
    }

}