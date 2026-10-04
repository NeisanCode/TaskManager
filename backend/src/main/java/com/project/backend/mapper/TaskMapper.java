package com.project.backend.mapper;

import org.springframework.stereotype.Component;

import com.project.backend.dto.TaskRequest;
import com.project.backend.dto.TaskResponse;
import com.project.backend.entity.Task;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        if (task == null) {
            return null;
        }
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setCreatedAt(task.getCreatedAt());
        return response;
    }

    public Task toEntity(TaskRequest request) {
        return new Task(request.getTitle(), request.getDescription(), request.getStatus(),
                request.getPriority());
    }

    public void updateEntity(Task task, TaskRequest request) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
    }

}