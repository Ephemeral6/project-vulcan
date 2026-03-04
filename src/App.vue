<script setup lang="ts">
import WorkflowSidebar from './components/WorkflowSidebar.vue'
import MoleculeViewer from './components/MoleculeViewer.vue'
import InfoPanel from './components/InfoPanel.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-gray-950 text-white">
    <aside class="w-1/5 min-w-[200px]">
      <WorkflowSidebar />
    </aside>
    <main class="relative flex-1">
      <MoleculeViewer />
    </main>
    <aside class="w-1/5 min-w-[240px]">
      <InfoPanel />
    </aside>
  </div>
</template>
