package com.project.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend.dto.TaskRequest;
import com.project.backend.dto.TaskResponse;
import com.project.backend.entity.Task;
import com.project.backend.exception.TaskNotFoundException;
import com.project.backend.mapper.TaskMapper;
import com.project.backend.repository.TaskRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public List<TaskResponse> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();

        List<TaskResponse> responses = new ArrayList<>();
        for (Task task : tasks) {
            responses.add(taskMapper.toResponse(task));
        }
        return responses;
    }

    public TaskResponse getTaskById(Long taskId) {
        Task task = findTaskOrThrow(taskId);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Task task = taskMapper.toEntity(request);
        Task savedTask = taskRepository.save(task);
        return taskMapper.toResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        Task existingTask = findTaskOrThrow(taskId);

        taskMapper.updateEntity(existingTask, request);
        Task savedTask = taskRepository.save(existingTask);

        return taskMapper.toResponse(savedTask);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        Task existingTask = findTaskOrThrow(taskId);
        taskRepository.delete(existingTask);
    }

    private Task findTaskOrThrow(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);

        if (task == null) {
            throw new TaskNotFoundException(taskId);
        }

        return task;
    }

}