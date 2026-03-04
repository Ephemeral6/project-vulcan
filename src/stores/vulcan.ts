import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CRAMBIN_PDB, ARV825_STATS, type MoleculeStats } from '@/data/crambin'

export type WorkflowStep = 'TargetView' | 'CandidateDisplay' | 'Evaluation'

/** Map SDF property names (case-insensitive) → MoleculeStats keys */
const SDF_PROP_MAP: Record<string, keyof MoleculeStats> = {
  mw: 'molecularWeight',
  molecularweight: 'molecularWeight',
  molecular_weight: 'molecularWeight',
  logp: 'logP',
  tpsa: 'tpsa',
  hbd: 'hbd',
  hba: 'hba',
  rotatablebonds: 'rotatableBonds',
  rotatable_bonds: 'rotatableBonds',
  molecularformula: 'molecularFormula',
  molecular_formula: 'molecularFormula',
  formula: 'molecularFormula',
  name: 'name',
}

const NUMERIC_KEYS = new Set<keyof MoleculeStats>([
  'molecularWeight', 'logP', 'tpsa', 'hbd', 'hba',
  'rotatableBonds', 'degradationEfficacy', 'qedScore',
])

function parseSdfProperties(text: string): Partial<MoleculeStats> {
  const result: Partial<MoleculeStats> = {}
  const regex = />\s*<([^>]+)>\s*\n\s*(.+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const rawKey = match[1].trim().toLowerCase().replace(/[\s-]/g, '')
    const rawVal = match[2].trim()
    const statsKey = SDF_PROP_MAP[rawKey]
    if (!statsKey) continue

    if (NUMERIC_KEYS.has(statsKey)) {
      const num = parseFloat(rawVal)
      if (!isNaN(num)) (result as any)[statsKey] = num
    } else {
      (result as any)[statsKey] = rawVal
    }
  }

  return result
}

const PDB_PLACEHOLDER: MoleculeStats = {
  name: '蛋白质',
  molecularFormula: '-',
  molecularWeight: 0,
  logP: 0,
  tpsa: 0,
  hbd: 0,
  hba: 0,
  rotatableBonds: 0,
  targetWarhead: '-',
  e3Ligand: '-',
  degradationEfficacy: 0,
  qedScore: 0,
}

export const useVulcanStore = defineStore('vulcan', () => {
  const currentStep = ref<WorkflowStep>('TargetView')
  const currentMoleculeStats = ref<MoleculeStats>({ ...ARV825_STATS })
  const currentMoleculeData = ref<string>(CRAMBIN_PDB)
  const currentMoleculeFormat = ref<'pdb' | 'sdf'>('pdb')

  function setStep(step: WorkflowStep) {
    currentStep.value = step
  }

  function loadMoleculeFromFile(fileContent: string, format: 'pdb' | 'sdf') {
    currentMoleculeData.value = fileContent
    currentMoleculeFormat.value = format

    if (format === 'sdf') {
      const parsed = parseSdfProperties(fileContent)
      currentMoleculeStats.value = {
        ...PDB_PLACEHOLDER,
        name: '小分子',
        ...parsed,
      }
    } else {
      // PDB — try to extract protein name from COMPND record
      const compndMatch = fileContent.match(/COMPND\s+\d*\s*MOLECULE:\s*(.+?);/i)
      currentMoleculeStats.value = {
        ...PDB_PLACEHOLDER,
        name: compndMatch ? compndMatch[1].trim() : '蛋白质',
      }
    }
  }

  return {
    currentStep,
    currentMoleculeStats,
    currentMoleculeData,
    currentMoleculeFormat,
    setStep,
    loadMoleculeFromFile,
  }
})
