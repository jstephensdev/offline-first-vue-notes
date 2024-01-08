<template>
  <div class="flex w-screen h-screen text-gray-700 mobile">
    <Sidebar />
    <div
      class="flex w-screen h-screen text-gray-700"
      v-if="Object.keys(this.notesStore.activeNote).length"
    >
      <Editor />
    </div>
    <Notes v-else />
  </div>
</template>
<script>
import { useNotesStore } from './store/NotesStore';
import Sidebar from './components/Sidebar.vue';
import Editor from './components/Editor.vue';
import Notes from './components/Notes.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    Editor,
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
  },
  beforeUnmount() {
    this.notesStore.editor.destroy();
  }
};
</script>

<style scoped>
/* tailiwnd md:block did not work */
@media (max-width: 900px) {
  .mobile {
    display: block;
  }
}
</style>
