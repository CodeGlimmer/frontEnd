<template>
  <v-app>
    <v-app-bar app color="primary" dark class="rounded-lg">
      <v-icon class="tw-ml-2">mdi-note-edit-outline</v-icon>
      <v-app-bar-title>Material Notes</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" class="mb-4">
            <v-slide-y-transition>
              <v-card ref="newNoteCard" elevation="3" class="mx-auto" max-width="800px">
                <v-card-title>
                  <v-text-field
                    v-model="newNote.title"
                    label="Title"
                    variant="underlined"
                    hide-details
                    @focus="handleNewNoteFocus"
                  ></v-text-field>
                </v-card-title>
                <v-card-text>
                  <v-textarea
                    v-model="newNote.content"
                    label="Take a note..."
                    variant="underlined"
                    auto-grow
                    rows="3"
                    hide-details
                    @focus="handleNewNoteFocus"
                  ></v-textarea>
                </v-card-text>
                <v-expand-transition>
                  <div v-if="isNewNoteExpanded">
                    <v-divider></v-divider>
                    <v-card-actions>
                      <v-menu offset-y>
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" icon variant="text" color="primary">
                            <v-icon>mdi-palette</v-icon>
                          </v-btn>
                        </template>
                        <v-card>
                          <v-card-text class="pa-2">
                            <div class="d-flex flex-wrap">
                              <v-btn
                                v-for="color in noteColors"
                                :key="color.name"
                                icon
                                class="ma-1"
                                size="small"
                                :style="{ backgroundColor: color.value }"
                                @click="newNote.color = color.value"
                              >
                                <v-icon v-if="newNote.color === color.value">mdi-check</v-icon>
                              </v-btn>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-menu>
                      <v-menu offset-y>
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" icon variant="text" color="primary">
                            <v-icon>mdi-label-outline</v-icon>
                          </v-btn>
                        </template>
                        <v-card min-width="200">
                          <v-list>
                            <v-list-item
                              v-for="(tag, index) in tags"
                              :key="index"
                              @click="toggleTag(tag)"
                            >
                              <template v-slot:prepend>
                                <v-icon :color="newNote.tags.includes(tag) ? 'primary' : ''">
                                  {{
                                    newNote.tags.includes(tag)
                                      ? 'mdi-checkbox-marked'
                                      : 'mdi-checkbox-blank-outline'
                                  }}
                                </v-icon>
                              </template>
                              <v-list-item-title>{{ tag }}</v-list-item-title>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item>
                              <v-text-field
                                v-model="newTag"
                                label="Add new tag"
                                hide-details
                                density="compact"
                                append-inner-icon="mdi-plus"
                                @click:append-inner="addNewTag"
                                @keyup.enter="addNewTag"
                              ></v-text-field>
                            </v-list-item>
                          </v-list>
                        </v-card>
                      </v-menu>
                      <v-spacer></v-spacer>
                      <v-btn variant="text" color="primary" @click="cancelNewNote"> Cancel </v-btn>
                      <v-btn
                        variant="text"
                        color="primary"
                        :disabled="!newNote.title && !newNote.content"
                        @click="addNote"
                      >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-slide-y-transition>
          </v-col>
        </v-row>

        <v-row class="mt-2">
          <v-col cols="12">
            <div v-if="filteredNotes.length === 0" class="text-center my-8">
              <v-icon size="64" color="grey">mdi-note-outline</v-icon>
              <div class="text-h6 text-grey mt-2">No notes yet</div>
            </div>
            <div v-else class="d-flex align-center mb-4">
              <v-text-field
                v-model="searchQuery"
                label="Search notes"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                class="mr-2"
              ></v-text-field>
              <v-menu offset-y>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="outlined" color="primary" class="ml-2">
                    <v-icon left>mdi-filter-variant</v-icon>
                    Filter
                  </v-btn>
                </template>
                <v-card min-width="250">
                  <v-list>
                    <v-list-subheader>Filter by tags</v-list-subheader>
                    <v-list-item
                      v-for="(tag, index) in tags"
                      :key="index"
                      @click="toggleFilterTag(tag)"
                    >
                      <template v-slot:prepend>
                        <v-icon :color="selectedTags.includes(tag) ? 'primary' : ''">
                          {{
                            selectedTags.includes(tag)
                              ? 'mdi-checkbox-marked'
                              : 'mdi-checkbox-blank-outline'
                          }}
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ tag }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <transition-group
            tag="div"
            class="note-container"
            :css="false"
            @before-enter="beforeEnter"
            @enter="enter"
            @leave="leave"
          >
            <v-col
              v-for="(note, index) in filteredNotes"
              :key="note.id"
              cols="12"
              sm="6"
              md="4"
              :data-index="index"
            >
              <v-card
                :color="note.color"
                :elevation="hoveredNote === note.id ? 4 : 1"
                class="note-card"
                @mouseover="hoveredNote = note.id"
                @mouseleave="hoveredNote = null"
                @click="editNote(note)"
              >
                <v-card-title class="text-h6">{{ note.title }}</v-card-title>
                <v-card-text>
                  <div class="text-body-1" style="white-space: pre-line">{{ note.content }}</div>
                  <div v-if="note.tags.length > 0" class="mt-2">
                    <v-chip
                      v-for="tag in note.tags"
                      :key="tag"
                      size="small"
                      class="ma-1"
                      variant="outlined"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-tooltip text="Archive" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" @click.stop="archiveNote(note.id)">
                        <v-icon>mdi-archive-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Delete" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" @click.stop="deleteNote(note.id)">
                        <v-icon>mdi-delete-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </v-card-actions>
              </v-card>
            </v-col>
          </transition-group>
        </v-row>
      </v-container>
    </v-main>

    <!-- Edit Note Dialog -->
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="editedNote.title"
            label="Title"
            variant="underlined"
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="editedNote.content"
            label="Note content"
            variant="underlined"
            auto-grow
            rows="5"
            hide-details
          ></v-textarea>
          <div class="mt-4">
            <v-chip
              v-for="tag in editedNote.tags"
              :key="tag"
              class="ma-1"
              closable
              @click:close="removeTagFromEdited(tag)"
            >
              {{ tag }}
            </v-chip>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon variant="text" color="primary">
                <v-icon>mdi-palette</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <div class="d-flex flex-wrap">
                  <v-btn
                    v-for="color in noteColors"
                    :key="color.name"
                    icon
                    class="ma-1"
                    size="small"
                    :style="{ backgroundColor: color.value }"
                    @click="editedNote.color = color.value"
                  >
                    <v-icon v-if="editedNote.color === color.value">mdi-check</v-icon>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon variant="text" color="primary">
                <v-icon>mdi-label-outline</v-icon>
              </v-btn>
            </template>
            <v-card min-width="200">
              <v-list>
                <v-list-item
                  v-for="(tag, index) in tags"
                  :key="index"
                  @click="toggleEditedTag(tag)"
                >
                  <template v-slot:prepend>
                    <v-icon :color="editedNote.tags.includes(tag) ? 'primary' : ''">
                      {{
                        editedNote.tags.includes(tag)
                          ? 'mdi-checkbox-marked'
                          : 'mdi-checkbox-blank-outline'
                      }}
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ tag }}</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item>
                  <v-text-field
                    v-model="newTag"
                    label="Add new tag"
                    hide-details
                    density="compact"
                    append-inner-icon="mdi-plus"
                    @click:append-inner="addNewTagToEdited"
                    @keyup.enter="addNewTagToEdited"
                  ></v-text-field>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="primary" @click="editDialog = false"> Cancel </v-btn>
          <v-btn variant="text" color="primary" @click="updateNote"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :timeout="2000" :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn v-if="snackbar.action" variant="text" @click="handleSnackbarAction"> Undo </v-btn>
        <v-btn variant="text" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>

    <!-- Floating Add Button -->
    <v-btn color="primary" icon size="large" class="floating-btn" @click="focusNewNote">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-app>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

export default {
  name: 'MaterialNotes',
  setup() {
    // Theme
    const darkMode = ref(localStorage.getItem('darkMode') === 'true')

    // Notes
    const notes = ref([])
    const archivedNotes = ref([])
    const nextId = ref(1)
    const hoveredNote = ref(null)

    // Search and filter
    const searchQuery = ref('')
    const selectedTags = ref([])

    // Tags
    const tags = ref(['Personal', 'Work', 'Ideas', 'Important'])
    const newTag = ref('')

    // New note
    const isNewNoteExpanded = ref(false)
    const newNote = ref({
      title: '',
      content: '',
      tags: [],
      color: 'white',
      createdAt: null,
    })
    const newNoteCard = ref(null)

    // Edit note
    const editDialog = ref(false)
    const editedNote = ref(null)
    const editedIndex = ref(-1)

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success',
      action: null,
      actionData: null,
    })

    // Note colors
    const noteColors = ref([
      { name: 'Default', value: 'white' },
      { name: 'Red', value: '#ffcdd2' },
      { name: 'Pink', value: '#f8bbd0' },
      { name: 'Purple', value: '#e1bee7' },
      { name: 'Deep Purple', value: '#d1c4e9' },
      { name: 'Indigo', value: '#c5cae9' },
      { name: 'Blue', value: '#bbdefb' },
      { name: 'Light Blue', value: '#b3e5fc' },
      { name: 'Cyan', value: '#b2ebf2' },
      { name: 'Teal', value: '#b2dfdb' },
      { name: 'Green', value: '#c8e6c9' },
      { name: 'Light Green', value: '#dcedc8' },
      { name: 'Lime', value: '#f0f4c3' },
      { name: 'Yellow', value: '#fff9c4' },
      { name: 'Amber', value: '#ffecb3' },
      { name: 'Orange', value: '#ffe0b2' },
      { name: 'Deep Orange', value: '#ffccbc' },
      { name: 'Brown', value: '#d7ccc8' },
      { name: 'Grey', value: '#f5f5f5' },
      { name: 'Blue Grey', value: '#cfd8dc' },
    ])

    // Filtered notes based on search and tags
    const filteredNotes = computed(() => {
      let filtered = [...notes.value]

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
      }

      // Filter by selected tags
      if (selectedTags.value.length > 0) {
        filtered = filtered.filter((note) =>
          selectedTags.value.some((tag) => note.tags.includes(tag)),
        )
      }

      // Sort by created date (newest first)
      return filtered.sort((a, b) => b.createdAt - a.createdAt)
    })

    // Load data from localStorage
    const loadData = () => {
      const savedNotes = localStorage.getItem('notes')
      const savedArchivedNotes = localStorage.getItem('archivedNotes')
      const savedTags = localStorage.getItem('tags')
      const savedNextId = localStorage.getItem('nextId')

      if (savedNotes) notes.value = JSON.parse(savedNotes)
      if (savedArchivedNotes) archivedNotes.value = JSON.parse(savedArchivedNotes)
      if (savedTags) tags.value = JSON.parse(savedTags)
      if (savedNextId) nextId.value = parseInt(savedNextId)
    }

    // Save data to localStorage
    const saveData = () => {
      localStorage.setItem('notes', JSON.stringify(notes.value))
      localStorage.setItem('archivedNotes', JSON.stringify(archivedNotes.value))
      localStorage.setItem('tags', JSON.stringify(tags.value))
      localStorage.setItem('nextId', nextId.value.toString())
      localStorage.setItem('darkMode', darkMode.value.toString())
    }

    // Toggle dark mode
    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value
      saveData()
    }

    // New note methods
    const handleNewNoteFocus = () => {
      isNewNoteExpanded.value = true
    }

    const focusNewNote = () => {
      isNewNoteExpanded.value = true
      nextTick(() => {
        const titleInput = newNoteCard.value.querySelector('input')
        if (titleInput) titleInput.focus()
      })
    }

    const resetNewNote = () => {
      newNote.value = {
        title: '',
        content: '',
        tags: [],
        color: 'white',
        createdAt: null,
      }
      isNewNoteExpanded.value = false
    }

    const cancelNewNote = () => {
      resetNewNote()
    }

    const addNote = () => {
      if (!newNote.value.title && !newNote.value.content) return

      const note = {
        id: nextId.value++,
        title: newNote.value.title,
        content: newNote.value.content,
        tags: [...newNote.value.tags],
        color: newNote.value.color,
        createdAt: new Date().getTime(),
      }

      notes.value.unshift(note)
      saveData()

      showSnackbar('Note added successfully', 'success')
      resetNewNote()
    }

    // Tag methods
    const toggleTag = (tag) => {
      const index = newNote.value.tags.indexOf(tag)
      if (index === -1) {
        newNote.value.tags.push(tag)
      } else {
        newNote.value.tags.splice(index, 1)
      }
    }

    const toggleEditedTag = (tag) => {
      if (!editedNote.value) return

      const index = editedNote.value.tags.indexOf(tag)
      if (index === -1) {
        editedNote.value.tags.push(tag)
      } else {
        editedNote.value.tags.splice(index, 1)
      }
    }

    const addNewTag = () => {
      if (!newTag.value || tags.value.includes(newTag.value)) {
        newTag.value = ''
        return
      }

      tags.value.push(newTag.value)
      newNote.value.tags.push(newTag.value)
      newTag.value = ''
      saveData()
    }

    const addNewTagToEdited = () => {
      if (!newTag.value || !editedNote.value || tags.value.includes(newTag.value)) {
        newTag.value = ''
        return
      }

      tags.value.push(newTag.value)
      editedNote.value.tags.push(newTag.value)
      newTag.value = ''
      saveData()
    }

    const removeTagFromEdited = (tag) => {
      if (!editedNote.value) return

      const index = editedNote.value.tags.indexOf(tag)
      if (index !== -1) {
        editedNote.value.tags.splice(index, 1)
      }
    }

    // Filter methods
    const toggleFilterTag = (tag) => {
      const index = selectedTags.value.indexOf(tag)
      if (index === -1) {
        selectedTags.value.push(tag)
      } else {
        selectedTags.value.splice(index, 1)
      }
    }

    // Note operations
    const editNote = (note) => {
      editedIndex.value = notes.value.findIndex((n) => n.id === note.id)
      editedNote.value = JSON.parse(JSON.stringify(note))
      editDialog.value = true
    }

    const updateNote = () => {
      if (editedIndex.value > -1) {
        notes.value.splice(editedIndex.value, 1, editedNote.value)
        saveData()
        showSnackbar('Note updated successfully', 'success')
      }
      editDialog.value = false
    }

    const archiveNote = (id) => {
      const index = notes.value.findIndex((note) => note.id === id)
      if (index === -1) return

      const archivedNote = notes.value[index]
      notes.value.splice(index, 1)
      archivedNotes.value.push(archivedNote)

      saveData()

      showSnackbar('Note archived', 'info', 'archive', { noteId: id, note: archivedNote })
    }

    const unarchiveNote = (noteId) => {
      const index = archivedNotes.value.findIndex((note) => note.id === noteId)
      if (index === -1) return

      const note = archivedNotes.value[index]
      archivedNotes.value.splice(index, 1)
      notes.value.unshift(note)

      saveData()

      showSnackbar('Note restored', 'success')
    }

    const deleteNote = (id) => {
      const index = notes.value.findIndex((note) => note.id === id)
      if (index === -1) return

      const deletedNote = notes.value[index]
      notes.value.splice(index, 1)

      saveData()

      showSnackbar('Note deleted', 'error', 'delete', { noteId: id, note: deletedNote, index })
    }

    const restoreDeletedNote = (noteData) => {
      notes.value.splice(noteData.index, 0, noteData.note)
      saveData()
      showSnackbar('Note restored', 'success')
    }

    // Snackbar
    const showSnackbar = (text, color, action = null, actionData = null) => {
      snackbar.value = {
        show: true,
        text,
        color,
        action,
        actionData,
      }
    }

    const handleSnackbarAction = () => {
      snackbar.value.show = false

      if (snackbar.value.action === 'delete') {
        restoreDeletedNote(snackbar.value.actionData)
      } else if (snackbar.value.action === 'archive') {
        unarchiveNote(snackbar.value.actionData.noteId)
      }
    }

    // GSAP animations
    const beforeEnter = (el) => {
      el.style.opacity = 0
      el.style.transform = 'scale(0.8)'
    }

    const enter = (el, done) => {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        delay: el.dataset.index * 0.05,
        ease: 'power2.out',
        onComplete: done,
      })
    }

    const leave = (el, done) => {
      gsap.to(el, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: done,
      })
    }

    // Lifecycle hooks
    onMounted(() => {
      loadData()
    })

    return {
      // Data
      notes,
      archivedNotes,
      newNote,
      newNoteCard,
      isNewNoteExpanded,
      filteredNotes,
      tags,
      newTag,
      selectedTags,
      searchQuery,
      darkMode,
      noteColors,
      hoveredNote,

      // Edit dialog
      editDialog,
      editedNote,
      editedIndex,

      // Snackbar
      snackbar,

      // Methods
      toggleDarkMode,
      handleNewNoteFocus,
      focusNewNote,
      cancelNewNote,
      addNote,
      toggleTag,
      toggleEditedTag,
      addNewTag,
      addNewTagToEdited,
      removeTagFromEdited,
      toggleFilterTag,
      editNote,
      updateNote,
      archiveNote,
      deleteNote,
      showSnackbar,
      handleSnackbarAction,

      // Animation methods
      beforeEnter,
      enter,
      leave,
    }
  },
}
</script>

<style scoped>
.note-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
  width: 100%;
}

.note-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.note-card:hover {
  transform: translateY(-4px);
}

.floating-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .floating-btn {
    bottom: 16px;
    right: 16px;
  }
}
</style>
