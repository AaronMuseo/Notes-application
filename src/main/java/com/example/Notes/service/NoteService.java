package com.example.Notes.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.Notes.application.Note;
import com.example.Notes.repository.NoteRepository;

@Service // indicates class is a service that handles logic
public class NoteService {

    //dependency
    private final NoteRepository noteRepository;

    //use the dependency that was defined and put it into the constructor
    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public Note saveNote(Note note) {
        if (note.getTitle() == null || note.getTitle().trim().isEmpty()) {
            note.setTitle("Untitled Note");
        }
        return noteRepository.save(note);
    }

    public void deleteNote(Long id){
        noteRepository.deleteById(id);
    }
}