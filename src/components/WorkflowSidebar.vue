<script setup lang="ts">
import { ref } from 'vue'
import { useVulcanStore, type WorkflowStep } from '@/stores/vulcan'

const store = useVulcanStore()

const steps: { key: WorkflowStep; label: string; icon: string }[] = [
  { key: 'TargetView', label: '靶点导入', icon: '🎯' },
  { key: 'CandidateDisplay', label: '候选分子展示', icon: '🧬' },
  { key: 'Evaluation', label: '筛选评估', icon: '📊' },
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadedFileName = ref<string>('')

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'pdb' && ext !== 'sdf') return

  const format = ext as 'pdb' | 'sdf'

  const reader = new FileReader()
  reader.onload = () => {
    const content = reader.result as string
    store.loadMoleculeFromFile(content, format)
    uploadedFileName.value = file.name
  }
  reader.readAsText(file)

  // Reset so the same file can be re-uploaded
  input.value = ''
}
</script>

<template>
  <div class="flex h-full flex-col border-r border-gray-800 bg-gray-900 p-4">
    <h2 class="mb-6 text-lg font-semibold tracking-wide text-gray-300">
      工作流程
    </h2>

    <nav class="flex flex-col gap-2">
      <button
        v-for="step in steps"
        :key="step.key"
        class="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors"
        :class="
          store.currentStep === step.key
            ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/40'
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
        "
        @click="store.setStep(step.key)"
      >
        <span class="text-lg">{{ step.icon }}</span>
        <span>{{ step.label }}</span>
      </button>
    </nav>

    <!-- File Upload -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdb,.sdf"
      class="hidden"
      @change="handleFileSelect"
    />

    <div class="mt-6">
      <button
        class="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-700 px-4 py-5 text-sm text-gray-400 transition-colors hover:border-indigo-500/50 hover:text-gray-300"
        @click="triggerFileInput"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span>上传 .pdb / .sdf 文件</span>
      </button>

      <p v-if="uploadedFileName" class="mt-2 truncate text-xs text-indigo-400">
        {{ uploadedFileName }}
      </p>
    </div>

    <div class="mt-auto pt-6 text-xs text-gray-600">
      Project Vulcan v0.1
    </div>
  </div>
</template>
