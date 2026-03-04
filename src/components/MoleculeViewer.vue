<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useVulcanStore } from '@/stores/vulcan'

const store = useVulcanStore()

// Deliberately NOT a Vue ref — avoid Proxy wrapping WebGL objects
let viewer: any = null

function applyStyle(format: 'pdb' | 'sdf') {
  if (format === 'pdb') {
    viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
  } else {
    viewer.setStyle({}, { stick: { colorscheme: 'Jmol' } })
  }
}

onMounted(async () => {
  const $3Dmol = await import('3dmol')
  const container = document.getElementById('mol-container')
  if (!container) return

  viewer = $3Dmol.createViewer(container, {
    backgroundColor: '0x111827',
    antialias: true,
  })

  viewer.addModel(store.currentMoleculeData, store.currentMoleculeFormat)
  applyStyle(store.currentMoleculeFormat)
  viewer.zoomTo()
  viewer.render()
})

watch(() => store.currentMoleculeData, (newVal) => {
  if (!viewer || !newVal) return
  viewer.removeAllModels()
  viewer.addModel(newVal, store.currentMoleculeFormat)
  applyStyle(store.currentMoleculeFormat)
  viewer.zoomTo()
  viewer.render()
})

function exportScreenshot() {
  if (!viewer) return
  const dataUri = viewer.pngURI()
  const a = document.createElement('a')
  a.href = dataUri
  a.download = 'vulcan_molecule.png'
  a.click()
}

onBeforeUnmount(() => {
  if (viewer) {
    viewer.spin(false)
    viewer.removeAllModels()
    viewer.clear()
    viewer = null
  }
})
</script>

<template>
  <div class="relative h-full w-full">
    <div
      id="mol-container"
      class="absolute inset-0"
      style="position: relative; width: 100%; height: 100%;"
    />

    <!-- Screenshot button -->
    <button
      class="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:bg-white/20"
      @click="exportScreenshot"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      导出高清截图
    </button>
  </div>
</template>
