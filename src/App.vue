<template>
  <div class="flex w-screen h-screen text-gray-700">
    <Sidebar />
    <div
      class="flex w-screen h-screen text-gray-700"
      v-if="Object.keys(this.notesStore.activeNote).length"
    >
      <EditorView />
    </div>
    <Notes v-else />
  </div>
</template>
<script>
import { Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useNotesStore } from './store/NotesStore';
import Sidebar from './components/Sidebar.vue';
import EditorView from './components/EditorView.vue';
import Notes from './components/Notes.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    EditorView,
    Notes
  },
  data() {
    return {
      isOffline: !navigator.onLine,
      notesStore: useNotesStore()
    };
  },
  async created() {
    this.notesStore.init();
  },
  mounted() {
    console.log('offline', this.isOffline);
    this.notesStore.editor = new Editor({
      content: '',
      extensions: [StarterKit],
      editorProps: {
        attributes: {
          class: 'prose my-6 mx-auto focus:outline-none border h-screen'
        }
      }
    });
  },
  beforeUnmount() {
    this.notesStore.editor.destroy();
  }
};
</script>
