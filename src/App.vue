<template>
  <div class="flex w-screen h-screen text-gray-700">
    <div class="flex flex-col flex-shrink-0 w-64 border-r border-gray-300 bg-gray-100">
      <!-- sidebar -->
      <div class="h-0 overflow-auto flex-grow">
        <div class="flex items-center h-8 px-3 group mt-4">
          <div class="flex items-center flex-grow focus:outline-none">
            <a class="ml-2 leading-none font-medium text-sm" href="#" @click.prevent="showAllNotes">
              All Notes
            </a>
          </div>
          <button
            class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
            @click="addNewNote"
          >
            +
          </button>
        </div>
        <div class="mt-4">
          <a
            class="flex items-center h-8 text-sm pl-8 pr-3"
            :class="
              this.activeNote.id === note.id
                ? 'flex items-center h-8 text-sm pl-8 pr-3 text-blue-600'
                : ''
            "
            href="#"
            v-for="note in notes"
            :key="note.id"
            @click.prevent="openNote(note)"
          >
            <span class="ml-2 leading-none">{{ new Date(note.created).toLocaleString() }}</span>
          </a>
        </div>
      </div>
    </div>
    <div class="flex flex-col flex-grow" v-if="Object.keys(activeNote).length">
      <!-- Editor -->
      <div class="flex flex-col flex-grow overflow-auto">
        <div v-if="editor" class="mx-auto">
          <button
            class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
            @click="editor.chain().focus().toggleBold().run()"
            :disabled="!editor.can().chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
          >
            bold
          </button>
          <button
            class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
            @click="editor.chain().focus().toggleItalic().run()"
            :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
          >
            italic
          </button>
          <button
            class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
            @click="editor.chain().focus().toggleStrike().run()"
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
          >
            strike
          </button>
          <button
            class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }"
          >
            bullet list
          </button>
          <button
            class="pl-2 pr-2 pt-0 pb-0 bg-white border border-gray-400 hover:bg-black hover:text-white"
            @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'is-active': editor.isActive('orderedList') }"
          >
            ordered list
          </button>
        </div>
        <editor-content :editor="editor" />
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
    <div class="flex flex-col flex-grow" v-else>
      <!-- All notes List -->
      <div class="flex flex-col flex-grow overflow-auto">
        <div v-for="note in notes" :key="note.id">
          <div class="flex px-4 pt-3 pb-4">
            <div class="prose my-2 mx-auto">
              <div>
                <span class="ml-1 text-xs text-gray-500"
                  >Created On {{ new Date(note.created).toLocaleString() }}</span
                >
              </div>
              <div v-html="note.content"></div>
            </div>
          </div>
          <hr class="w-full" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
export default {
  name: 'App',
  components: {
    EditorContent
  },
  data() {
    return {
      editor: null,
      database: null,
      notes: [],
      activeNote: {}
    };
  },
  async created() {
    this.database = await this.getDatabase();
    let notes = await this.getNotes();
    this.notes = notes.reverse();
  },
  mounted() {
    this.editor = new Editor({
      content: '',
      extensions: [StarterKit],
      editorProps: {
        attributes: {
          class: 'prose my-6 mx-auto focus:outline border h-screen'
        }
      }
    });
  },
  beforeUnmount() {
    this.editor.destroy();
  },
  methods: {
    async getDatabase() {
      return new Promise((resolve, reject) => {
        let db = window.indexedDB.open('notes');

        db.onerror = (e) => {
          reject('Error opening the database');
        };

        db.onsuccess = (e) => {
          resolve(e.target.result);
        };

        db.onupgradeneeded = (e) => {
          e.target.result.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        };
      });
    },
    async saveNote() {
      return new Promise((resolve, reject) => {
        let noteStore = this.database.transaction('notes', 'readwrite').objectStore('notes');

        const noteRequest = noteStore.get(this.activeNote.id);

        noteRequest.onerror = (e) => {
          reject('Error retriving the note to update');
        };

        noteRequest.onsuccess = (e) => {
          let note = e.target.result;
          note.content = this.editor.getHTML();

          let updateRequest = noteStore.put(note);

          updateRequest.onerror = (e) => {
            reject('Error updating the note');
          };

          updateRequest.onsuccess = (e) => {
            // optimistically updating
            let noteIndex = this.notes.findIndex((n) => n.id === note.id);
            this.notes[noteIndex] = note;
            resolve();
          };
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
    openNote(note) {
      this.editor.commands.setContent(note.content);
      this.activeNote = note;
    },
    showAllNotes() {
      // clear the editor
      this.editor.commands.clearContent();
      // set the activeNote as an empty object
      this.activeNote = {};
    },
    addNewNote() {
      // clear the editor of content
      this.editor.commands.clearContent();
      // add a blank note to the database
      return new Promise((resolve, reject) => {
        let transaction = this.database.transaction('notes', 'readwrite');
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
          // optimistically updating
          this.notes.unshift(note);
          this.activeNote = note;
        };
      });
    }
  }
};
</script>
