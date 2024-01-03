<template>
  <div class="flex flex-col flex-grow">
    <!-- Editor -->
    <div class="flex flex-col flex-grow overflow-auto">
      <editor-content :editor="this.notesStore.editor" />
    </div>
    <div class="h-16 bg-gray-100 border-t border-gray-300 text-right items-center">
      <button
        @click="saveNote()"
        class="m-4 pl-3 pr-3 pt-1 pb-1 bg-white border border-gray-400 hover:bg-black hover:text-white"
      >
        Save Note
      </button>
    </div>
  </div>
</template>

<script>
import { EditorContent } from '@tiptap/vue-3';
import { useNotesStore } from '../store/NotesStore';

export default {
  name: 'Editor',
  components: {
    EditorContent
  },
  data() {
    return {
      notesStore: useNotesStore()
    };
  },
  methods: {
    async saveNote() {
      return new Promise((resolve, reject) => {
        let noteStore = this.notesStore.database
          .transaction('notes', 'readwrite')
          .objectStore('notes');

        const noteRequest = noteStore.get(this.notesStore.activeNote.id);

        noteRequest.onerror = (e) => {
          console.log('Error retriving the note to update');
        };

        noteRequest.onsuccess = (e) => {
          let note = e.target.result;
          note.content = this.notesStore.editor.getHTML();

          let updateRequest = noteStore.put(note);

          updateRequest.onerror = (e) => {
            console.log('Error updating the note');
          };

          updateRequest.onsuccess = (e) => {
            // optimistically updating rather than make getNotes request
            let noteIndex = this.notesStore.notes.findIndex((n) => n.id === note.id);
            this.notesStore.notes[noteIndex] = note;
            this.notesStore.showAllNotes();
            resolve();
          };
        };
      });
    }
  }
};
</script>
