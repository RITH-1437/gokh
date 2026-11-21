<template>
  <div class="space-y-4">
    <!-- Crew avatars -->
    <div v-if="members.length > 0" class="flex flex-wrap gap-x-7 gap-y-5">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex flex-col items-center gap-1.5 animate-pop-in"
      >
        <div class="relative">
          <Avatar :name="member.name" :role="member.role" size="lg" :tone="memberIndex(member.id)" />
          <button
            v-if="editingMemberId !== member.id"
            class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-stone-200 text-ink-mute shadow-soft flex items-center justify-center hover:text-cambodia-700 hover:border-cambodia-300 transition-colors"
            title="Edit name"
            aria-label="Edit name"
            @click="startEdit(member)"
          >
            <Icon name="edit" :size="12" />
          </button>
        </div>

        <div class="text-center min-w-[64px]">
          <div v-if="editingMemberId === member.id" class="flex items-center gap-1">
            <input
              v-model="editingMemberName"
              aria-label="Traveler name"
              maxlength="50"
              class="w-20 h-8 px-2 text-[13px] rounded-lg border border-cambodia-400 focus:outline-none focus:ring-4 focus:ring-cambodia-100"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
              @blur="saveEdit"
            />
          </div>
          <div v-else>
            <div class="text-[13px] font-bold text-ink leading-tight">{{ member.name }}</div>
            <div v-if="member.role === 'leader'" class="text-[11px] font-semibold text-sand-600">
              Trip Leader
            </div>
          </div>
        </div>

        <div v-if="editingMemberId !== member.id" class="flex gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
          <button
            v-if="member.role !== 'leader'"
            class="p-1 rounded-full text-ink-mute hover:text-sand-600 transition-colors"
            title="Make trip leader"
            aria-label="Make trip leader"
            @click="makeLeader(member)"
          >
            <Icon name="crown" :size="14" />
          </button>
          <button
            class="p-1 rounded-full text-ink-mute hover:text-clay-600 transition-colors"
            title="Remove traveler"
            aria-label="Remove traveler"
            @click="removeMember(member)"
          >
            <Icon name="trash-2" :size="14" />
          </button>
        </div>
      </div>

      <!-- Add traveler -->
      <button
        v-if="!showAdd"
        class="flex flex-col items-center justify-center gap-1.5 w-[64px] h-[104px] rounded-2xl border-2 border-dashed border-stone-300 text-ink-mute hover:border-cambodia-400 hover:text-cambodia-700 hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200 focus-ring active:scale-[.98]"
        @click="showAdd = true"
      >
        <span class="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-soft">
          <Icon name="plus" :size="16" />
        </span>
        <span class="text-[11px] font-semibold">Add traveler</span>
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="surface !rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left"
    >
      <Emoji3D emoji="🧑‍🤝‍🧑" size="lg" shape="tile" float />
      <div class="flex-1 min-w-0">
        <p class="font-bold text-ink text-lg leading-snug">Who's joining the adventure?</p>
        <p class="text-sm text-ink-mute mt-1">Add your crew and choose a trip leader — the first traveler becomes the leader.</p>
      </div>
      <button class="btn-primary shrink-0" @click="showAdd = true">
        <Icon name="plus" :size="18" />
        Add traveler
      </button>
    </div>

    <!-- Backdrop for mobile bottom sheet -->
    <div v-if="showAdd" class="fixed inset-0 bg-ink/30 backdrop-blur-[2px] z-30 sm:hidden animate-fade-in" @click="showAdd = false" />

    <!-- Add traveler panel (bottom sheet on mobile) -->
    <div v-if="showAdd" :class="['animate-slide-down sm:animate-fade-up', 'sm:mt-4', 'max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-t-3xl max-sm:bg-white max-sm:p-5 max-sm:shadow-lift max-sm:z-40']">
      <div class="flex items-center justify-between sm:hidden mb-3">
        <p class="font-bold text-ink">Add traveler</p>
        <button class="p-1.5 rounded-full hover:bg-stone-100" @click="showAdd = false" aria-label="Close">
          <Icon name="x" :size="16" />
        </button>
      </div>
      <div class="flex gap-2">
        <input
          v-model="newMemberName"
          type="text"
          class="field !h-12 flex-1"
          placeholder="Traveler name"
          aria-label="Traveler name"
          maxlength="50"
          autofocus
          @keyup.enter="addMember"
          @keyup.esc="showAdd = false"
        />
        <button class="btn-primary !h-12 !px-4" :disabled="!newMemberName.trim()" @click="addMember">
          <Icon name="plus" :size="18" />
        </button>
      </div>
      <p class="text-[12px] text-ink-mute mt-2">
        The first traveler you add becomes the trip leader. 👑
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Member } from '../types/trip'
import { validateMember } from '../utils/validation'
import { useToasts } from '../composables/useToasts'
import Avatar from './Avatar.vue'
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  members: Member[]
}>()

const emit = defineEmits<{
  add: [name: string]
  remove: [memberId: string]
  update: [memberId: string, updates: Partial<Member>]
}>()

const { success, error, info } = useToasts()

const showAdd = ref(false)
const newMemberName = ref('')
const editingMemberId = ref<string | null>(null)
const editingMemberName = ref('')

const memberIndex = (id: string) => props.members.findIndex(m => m.id === id)

const addMember = () => {
  const name = newMemberName.value.trim()
  if (!name) return

  const validation = validateMember(name, props.members)
  if (!validation.isValid) {
    error('That name is already in the crew', validation.errors[0])
    return
  }

  emit('add', name)
  success('Traveler added', `${name} is joining the trip`)
  newMemberName.value = ''
  showAdd.value = false
}

const removeMember = (member: Member) => {
  const remaining = props.members.filter(m => m.id !== member.id)
  emit('remove', member.id)
  info('Traveler removed', `${member.name} is no longer on this trip`)
  if (member.role === 'leader' && remaining.length > 0) {
    info(`${remaining[0].name} is now the trip leader`)
  }
}

const makeLeader = (member: Member) => {
  emit('update', member.id, { role: 'leader' })
  success('New trip leader', `${member.name} is leading the crew`)
}

const startEdit = (member: Member) => {
  editingMemberId.value = member.id
  editingMemberName.value = member.name
}

const saveEdit = () => {
  if (!editingMemberId.value) return
  const id = editingMemberId.value
  const name = editingMemberName.value.trim()
  const otherMembers = props.members.filter(m => m.id !== id)

  if (name && name !== props.members.find(m => m.id === id)?.name) {
    const validation = validateMember(name, otherMembers)
    if (!validation.isValid) {
      error('That name is taken', validation.errors[0])
      return
    }
    emit('update', id, { name })
    success('Name updated')
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingMemberId.value = null
  editingMemberName.value = ''
}
</script>