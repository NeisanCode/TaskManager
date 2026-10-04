package com.project.backend.service;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import com.project.backend.entity.Task;
import com.project.backend.entity.TaskPriority;
import com.project.backend.entity.TaskStatus;
import com.project.backend.exception.TaskNotFoundException;
import com.project.backend.mapper.TaskMapper;
import com.project.backend.repository.TaskRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Spy
    private TaskMapper taskMapper = new TaskMapper();

    @InjectMocks
    private TaskService taskService;

    @Test
    void findById_returnsTask_whenItExists() {
        // Checks that an existing task is returned with the right title.
        Task task = new Task("Rediger le rapport", null, TaskStatus.TODO, TaskPriority.HIGH);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertEquals("Rediger le rapport", taskService.getTaskById(1L).getTitle());
    }

    @Test
    void findById_throwsTaskNotFoundException_whenTaskDoesNotExist() {
        // Checks that an unknown id raises TaskNotFoundException.
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TaskNotFoundException.class, () -> taskService.getTaskById(99L));
    }

}