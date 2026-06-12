package com.example.Notes.controller;



import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Notes.application.Note;
import com.example.Notes.service.NoteService;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.vercel.app"})
public class NoteController {

    private final NoteService noteService;

    
    public NoteController(NoteService noteService){
        this.noteService = noteService;
    }

    @GetMapping // handles GET requests
    public List<Note> getNotes(){
        return noteService.getAllNotes();
    }

    @PostMapping // handles POST requests
    public Note createNote(@RequestBody Note note) {
        return noteService.saveNote(note); //creates the note
    }

     @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id){
        noteService.deleteNote(id);
    }
    
  
}
