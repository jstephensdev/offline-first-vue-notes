<template>
  <div class="flex flex-col flex-shrink-0 w-64 border-r border-gray-300 bg-gray-100">
    <!-- sidebar -->
    <div class="h-0 overflow-auto flex-grow">
      <div class="flex items-center h-8 px-3 group mt-4">
        <div class="flex items-center flex-grow focus:outline-none">
          <a
            class="ml-2 leading-none font-medium text-sm"
            href="#"
            @click.prevent="this.notesStore.showAllNotes()"
          >
            All Notes
          </a>
        </div>
        <button
          class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
          @click="this.addNewNote()"
        >
          +
        </button>
      </div>
      <div class="mt-4">
        <a
          class="flex items-center h-8 text-sm pl-8 pr-3"
          href="#"
          v-for="note in this.notesStore.notes"
          :class="
            this.notesStore.activeNote.id === note.id
              ? 'flex items-center h-8 text-sm pl-8 pr-3 text-blue-600'
              : ''
          "
          :key="note.id"
          @click.prevent="this.openNote(note)"
        >
          <span class="ml-2 leading-none">{{ new Date(note.created).toLocaleString() }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { useNotesStore } from '../store/NotesStore';
export default {
  name: 'Sidebar',
  data() {
    return {
      notesStore: useNotesStore()
    };
  },
  methods: {
    openNote(note) {
      this.notesStore.editor.commands.setContent(note.content);
      this.notesStore.activeNote = note;
    },
    addNewNote() {
      // clear the editor of content
      this.notesStore.editor.commands.clearContent();
      // add a blank note to the database
      return new Promise((resolve, reject) => {
        let transaction = this.notesStore.database.transaction('notes', 'readwrite');
        transaction.oncomplete = (e) => {
          resolve();
        };
        let now = new Date();
        let note = {
          content: '',
          created: now.getTime()
        };
        transaction.objectStore('notes').add(note).onsuccess = (e) => {
          note.id = e.target.result;
          // add that same note to the sidebar
          // optimistically updating rather than make getNotes request
          this.notesStore.notes.unshift(note);
          // update store
          this.notesStore.activeNote = note;
        };
      });
    }
  }
};
</script>
