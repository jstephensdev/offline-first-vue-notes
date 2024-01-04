import { defineStore } from 'pinia';
import { Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

export const useNotesStore = defineStore('NotesStore', {
  // state
  state: () => {
    return {
      editor: null,
      database: null,
      notes: [],
      activeNote: {}
    };
  },
  // actions
  actions: {
    async init() {
      this.database = await this.getDatabase();
      let notes = await this.getNotes();
      this.notes = notes.reverse();
      this.editor = new Editor({
        content: '',
        extensions: [StarterKit],
        editorProps: {
          attributes: {
            class: 'prose my-6 mx-auto px-2 py-2 border focus:outline-none h-screen'
          }
        }
      });
    },
    async getDatabase() {
      return new Promise((resolve, reject) => {
        let db = window.indexedDB.open('notes');

        db.onerror = (e) => {
          console.log('Error opening the database');
        };

        db.onsuccess = (e) => {
          resolve(e.target.result);
        };

        db.onupgradeneeded = (e) => {
          e.target.result.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        };
      });
    },
    async getNotes() {
      return new Promise((reslove, reject) => {
        this.database.transaction('notes').objectStore('notes').getAll().onsuccess = (e) => {
          reslove(e.target.result);
        };
      });
    },
    showAllNotes() {
      this.editor.commands.clearContent();
      this.activeNote = {};
    }
  }
});
