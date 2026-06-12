package com.example.Notes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Notes.application.Note;

public interface NoteRepository extends JpaRepository<Note, Long> {

   
    
}
