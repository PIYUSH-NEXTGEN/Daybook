import { useState, useEffect } from 'react'
import { Cpu, Check, RefreshCw, ShieldCheck } from 'lucide-react'

export interface ModelOption {
  id: string
  name: string
  tag: string
  size?: string
  description?: string
  isInstalled?: boolean
}

interface SettingsViewProps {
  initialModel?: string
  customModels?: ModelOption[]
  onSelectModel?: (modelId: string) => void
}

const defaultModels: ModelOption[] = [
  {
    id: 'gemma3:4b',
    name: 'Gemma 3:4B',
    tag: 'gemma3:4b',
    size: '3.3 GB',
    description: 'Google DeepMind 4.3B local model, fast and optimized for reflection',
    isInstalled: true
  },
  {
    id: 'llama3.2:3b',
    name: 'Llama 3.2:3B',
    tag: 'llama3.2:3b',
    size: '2.0 GB',
    description: 'Meta lightweight model for rapid reasoning and conversational notes',
    isInstalled: false
  },
  {
    id: 'mistral:7b',
    name: 'Mistral 7B',
    tag: 'mistral:7b',
    size: '4.1 GB',
    description: 'High capacity model for extensive analysis and deep synthesis',
    isInstalled: false
  },
  {
    id: 'phi3:mini',
    name: 'Phi-3 Mini',
    tag: 'phi3:mini',
    size: '2.3 GB',
    description: 'Microsoft compact model for quick reflections on low resource hardware',
    isInstalled: false
  }
]

export function SettingsView({
  initialModel,
  customModels,
  onSelectModel
}: SettingsViewProps) {
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return initialModel || localStorage.getItem('daybook_ai_model') || 'gemma3:4b'
  })

  const [fetchedOllamaModels, setFetchedOllamaModels] = useState<ModelOption[]>([])
  const [isLoadingOllama, setIsLoadingOllama] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState<string>('Local Ollama ready')

  const models: ModelOption[] = (customModels && customModels.length > 0)
    ? customModels
    : (fetchedOllamaModels.length > 0 ? fetchedOllamaModels : defaultModels)

  function parseModelsFromApi(data: { models?: Array<{ name?: string; model?: string; size?: number; details?: { family?: string } }> }) {
    if (!data || !Array.isArray(data.models) || data.models.length === 0) {
      return null
    }
    const installedIds = new Set(data.models.map((m) => m.name || m.model))
    const updated = defaultModels.map((m) => ({
      ...m,
      isInstalled: installedIds.has(m.id) || installedIds.has(m.tag)
    }))

    for (const item of data.models) {
      const id = item.name || item.model
      if (id && !updated.some((u) => u.id === id)) {
        updated.push({
          id,
          name: id,
          tag: id,
          size: item.size ? `${(item.size / 1024 / 1024 / 1024).toFixed(1)} GB` : undefined,
          description: item.details?.family ? `${item.details.family} model from Ollama` : 'Local Ollama model',
          isInstalled: true
        })
      }
    }
    return {
      models: updated,
      count: data.models.length
    }
  }

  useEffect(() => {
    if (customModels && customModels.length > 0) {
      return
    }

    let isMounted = true

    async function loadModelsOnMount() {
      try {
        const res = await fetch('/api/ollama/api/tags')
        if (!isMounted) return
        if (res.ok) {
          const data = await res.json()
          if (!isMounted) return
          const parsed = parseModelsFromApi(data)
          if (parsed) {
            setFetchedOllamaModels(parsed.models)
            setOllamaStatus(`Connected (${parsed.count} installed)`)
            return
          }
        }
        if (isMounted) {
          setOllamaStatus('Default model configured')
        }
      } catch (e) {
        void e
        if (isMounted) {
          setOllamaStatus('Offline fallback active')
        }
      }
    }

    void loadModelsOnMount()

    return () => {
      isMounted = false
    }
  }, [customModels])

  async function handleManualRefresh() {
    setIsLoadingOllama(true)
    try {
      const res = await fetch('/api/ollama/api/tags')
      if (res.ok) {
        const data = await res.json()
        const parsed = parseModelsFromApi(data)
        if (parsed) {
          setFetchedOllamaModels(parsed.models)
          setOllamaStatus(`Connected (${parsed.count} installed)`)
          setIsLoadingOllama(false)
          return
        }
      }
      setOllamaStatus('Default model configured')
    } catch (e) {
      void e
      setOllamaStatus('Offline fallback active')
    }
    setIsLoadingOllama(false)
  }

  function handleModelSelect(modelId: string) {
    setSelectedModel(modelId)
    try {
      localStorage.setItem('daybook_ai_model', modelId)
      window.dispatchEvent(new Event('daybook_model_changed'))
    } catch (e) {
      void e
    }
    if (onSelectModel) {
      onSelectModel(modelId)
    }
  }

  return (
    <div className="w-full flex flex-col justify-between space-y-4 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#4f8ee6]" />
            <h3 className="text-sm sm:text-base font-bold text-[#1a2b49]">
              Change AI Model
            </h3>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isLoadingOllama}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4f8ee6] hover:text-[#3876cb] transition-colors cursor-pointer disabled:opacity-50"
            title="Scan installed models"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingOllama ? 'animate-spin' : ''}`} />
            <span>{ollamaStatus}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Select the local model used for journal reflection, prompt suggestions, and pattern detection. Models run privately on your machine.
        </p>

        <div className="space-y-2.5">
          {models.map((model) => {
            const isSelected = selectedModel === model.id || selectedModel === model.tag
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => handleModelSelect(model.id)}
                className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#eff6fc]/70 border-[#6eafe9] shadow-xs'
                    : 'bg-[#FAF9F5] border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1a2b49]">
                      {model.name}
                    </span>
                    {model.size && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200/70 shadow-2xs">
                        {model.size}
                      </span>
                    )}
                    {model.isInstalled && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Installed
                      </span>
                    )}
                  </div>
                  {model.description && (
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-normal">
                      {model.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#6eafe9] px-2.5 py-1 rounded-full shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 px-2 py-1 rounded-full border border-slate-200 bg-white">
                      Select
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>
          Private inference via Ollama. Journal entries never leave your device.
        </span>
      </div>
    </div>
  )
}
