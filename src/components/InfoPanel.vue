<script setup lang="ts">
import { computed } from 'vue'
import { useVulcanStore } from '@/stores/vulcan'

const store = useVulcanStore()

const propertyLabels: Record<string, string> = {
  molecularFormula: '分子式',
  molecularWeight: '分子量',
  logP: 'LogP',
  tpsa: 'TPSA (A²)',
  hbd: '氢键供体',
  hba: '氢键受体',
  rotatableBonds: '可旋转键',
  targetWarhead: '靶向弹头',
  e3Ligand: 'E3 配体',
}

/** Changes on every stats update — drives transition re-render */
const statsVersion = computed(() => store.currentMoleculeStats.name + store.currentMoleculeStats.molecularWeight)
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto border-l border-gray-800 bg-gray-900 p-4">
    <h2 class="mb-1 text-lg font-semibold text-gray-300">
      {{ store.currentMoleculeStats.name }}
    </h2>
    <p class="mb-5 text-xs text-gray-500">理化参数面板</p>

    <!-- Property grid with fade-in on data change -->
    <Transition name="fade" mode="out-in">
      <dl :key="statsVersion" class="space-y-3">
        <div
          v-for="(label, key) in propertyLabels"
          :key="key"
          class="flex items-center justify-between rounded-md bg-gray-800/50 px-3 py-2"
        >
          <dt class="text-xs text-gray-400">{{ label }}</dt>
          <dd class="text-sm font-medium text-gray-200">
            {{ (store.currentMoleculeStats as Record<string, unknown>)[key] }}
          </dd>
        </div>
      </dl>
    </Transition>

    <!-- Progress bars -->
    <div class="mt-6 space-y-4">
      <!-- Degradation Efficacy -->
      <div>
        <div class="mb-1 flex items-center justify-between">
          <span class="text-xs text-gray-400">降解效率</span>
          <span class="text-sm font-semibold text-emerald-400">
            {{ store.currentMoleculeStats.degradationEfficacy }}%
          </span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-gray-800">
          <div
            class="h-full rounded-full bg-emerald-500 transition-all duration-500"
            :style="{ width: store.currentMoleculeStats.degradationEfficacy + '%' }"
          />
        </div>
      </div>

      <!-- QED Score -->
      <div>
        <div class="mb-1 flex items-center justify-between">
          <span class="text-xs text-gray-400">QED 评分</span>
          <span class="text-sm font-semibold text-amber-400">
            {{ store.currentMoleculeStats.qedScore }}
          </span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-gray-800">
          <div
            class="h-full rounded-full bg-amber-500 transition-all duration-500"
            :style="{ width: (store.currentMoleculeStats.qedScore * 100) + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.35s ease-in;
}
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
