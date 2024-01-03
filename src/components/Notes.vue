<template>
  <div class="flex flex-col flex-grow">
    <!-- All notes List -->
    <div class="flex flex-col flex-grow overflow-auto">
      <div v-for="note in this.notesStore.notes" :key="note.id">
        <div class="h-10 mr-3 mt-3 text-right items-center">
          <button
            @click="deleteNote(note.id)"
            class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
          >
            X
          </button>
        </div>
        <div class="flex px-4 pt-3 pb-4">
          <div class="prose my-2 mx-auto">
            <span class="ml-1 text-xs text-gray-500"
              >Created On {{ new Date(note.created).toLocaleString() }}</span
            >
            <div v-html="note.content"></div>
          </div>
        </div>
        <hr class="w-full" />
      </div>
    </div>
  </div>
</template>

<script>
import { useNotesStore } from '../store/NotesStore';
export default {
  name: 'Notes',
  data() {
    return {
      notesStore: useNotesStore()
    };
  },
  methods: {
    async deleteNote(noteId) {
      let transaction = this.notesStore.database.transaction('notes', 'readwrite');
      const store = transaction.objectStore('notes');

      const request = store.delete(noteId);

      request.onerror = (e) => {
        console.error('Error deleting item:', e);
      };

      request.onsuccess = () => {
        // optimistically updating rather than make getNotes request
        let noteIndex = this.notesStore.notes.findIndex((n) => n.id === noteId);
        this.notesStore.notes.splice(noteIndex, 1);
      };
    }
  }
};
</script>
