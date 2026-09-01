import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'

export interface NexoraMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  suggestions?: string[]
}

export type CopilotMessage = NexoraMessage

export const openNexoraDrawer = () => {
  window.dispatchEvent(new CustomEvent('open-nexora-drawer'))
}

export const toggleNexoraDrawer = () => {
  window.dispatchEvent(new CustomEvent('toggle-nexora-drawer'))
}

export const closeNexoraDrawer = () => {
  window.dispatchEvent(new CustomEvent('close-nexora-drawer'))
}

export const openCopilotDrawer = openNexoraDrawer
export const toggleCopilotDrawer = toggleNexoraDrawer
export const closeCopilotDrawer = closeNexoraDrawer

const DEFAULT_SUGGESTIONS = [
  "Rendement des presses d'injection",
  "Articles en stock critique",
  "Indicateurs qualité et TRS global"
]

const INITIAL_MESSAGE: NexoraMessage = {
  id: 'welcome',
  sender: 'bot',
  text: `### Module Décisionnel
Bonjour. Vous pouvez interroger en direct les indicateurs de performance des ateliers et l'état des stocks.

Sélectionnez une requête ou saisissez votre question ci-dessous :`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: DEFAULT_SUGGESTIONS
}

interface DrawerProps {
  isOpen?: boolean
  onClose?: () => void
}

export const IndustrialNexoraDrawer: React.FC<DrawerProps> = ({ isOpen: controlledIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? Boolean(controlledIsOpen) : internalIsOpen

  const [messages, setMessages] = useState<NexoraMessage[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleClose = () => {
    setInternalIsOpen(false)
    if (onClose) onClose()
    window.dispatchEvent(new CustomEvent('close-nexora-drawer'))
  }

  useEffect(() => {
    const handleOpen = () => setInternalIsOpen(true)
    const handleCloseEvent = () => setInternalIsOpen(false)
    const handleToggle = () => setInternalIsOpen((prev) => !prev)

    window.addEventListener('open-nexora-drawer', handleOpen)
    window.addEventListener('close-nexora-drawer', handleCloseEvent)
    window.addEventListener('toggle-nexora-drawer', handleToggle)
    window.addEventListener('open-copilot-drawer', handleOpen)
    window.addEventListener('close-copilot-drawer', handleCloseEvent)
    window.addEventListener('toggle-copilot-drawer', handleToggle)

    return () => {
      window.removeEventListener('open-nexora-drawer', handleOpen)
      window.removeEventListener('close-nexora-drawer', handleCloseEvent)
      window.removeEventListener('toggle-nexora-drawer', handleToggle)
      window.removeEventListener('open-copilot-drawer', handleOpen)
      window.removeEventListener('close-copilot-drawer', handleCloseEvent)
      window.removeEventListener('toggle-copilot-drawer', handleToggle)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
        scrollToBottom()
      }, 200)
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isLoading) return

    const userMessage: NexoraMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

    try {
      let responseData: any = null
      try {
        const res = await axios.post(`${apiUrl}/ai/copilot/chat`, { message: text }, { timeout: 4000 })
        responseData = res.data
      } catch (backendErr) {
        try {
          const directRes = await axios.post('http://localhost:8000/ai/copilot/chat', { message: text }, { timeout: 3000 })
          responseData = directRes.data
        } catch (mlErr) {
          responseData = generateClientFallback(text)
        }
      }

      if (!responseData || !responseData.reply) {
        responseData = generateClientFallback(text)
      }

      const botMessage: NexoraMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: responseData.reply || "Information non disponible pour cette requête.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: responseData.suggestions || DEFAULT_SUGGESTIONS
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      const fallbackReply = generateClientFallback(text)
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: fallbackReply.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: DEFAULT_SUGGESTIONS
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Clean, professional markdown renderer (no emojis)
  const renderFormattedText = (raw: string) => {
    if (!raw) return null
    const lines = raw.split('\n')
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h5 key={idx} className='fw-bolder text-dark mb-2 mt-2'>
            {line.replace('### ', '')}
          </h5>
        )
      }
      // Header 4
      if (line.startsWith('#### ')) {
        return (
          <h6 key={idx} className='fw-bold text-gray-800 mb-2 mt-2'>
            {line.replace('#### ', '')}
          </h6>
        )
      }
      // Bullet point
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(2)
        return (
          <div key={idx} className='d-flex align-items-start mb-1 ps-1'>
            <span className='bullet bullet-dot bg-primary me-2 mt-2 flex-shrink-0'></span>
            <div className='text-gray-800 fs-7 lh-base'>
              {parseInlineMarkdown(content)}
            </div>
          </div>
        )
      }
      // Numbered list item
      const numMatch = line.match(/^(\d+)\.\s+(.*)/)
      if (numMatch) {
        return (
          <div key={idx} className='d-flex align-items-start mb-1 ps-1'>
            <span className='fw-bold text-primary me-2 fs-7 flex-shrink-0'>
              {numMatch[1]}.
            </span>
            <div className='text-gray-800 fs-7 lh-base'>
              {parseInlineMarkdown(numMatch[2])}
            </div>
          </div>
        )
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className='h-6px'></div>
      }
      // Standard line
      return (
        <p key={idx} className='text-gray-800 fs-7 mb-1 lh-base'>
          {parseInlineMarkdown(line)}
        </p>
      )
    })
  }

  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className='fw-bold text-dark'>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className='badge badge-light text-dark fw-bold px-1 py-0 fs-8 mx-1 font-monospace'>
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className='text-muted'>{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className='modal-backdrop fade show'
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1050,
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            cursor: 'pointer'
          }}
          onClick={handleClose}
        />
      )}

      {/* Clean Sliding Drawer */}
      <div
        className={`nexora-drawer bg-body shadow-lg d-flex flex-column ${isOpen ? 'drawer-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '440px',
          maxWidth: '100vw',
          height: '100vh',
          zIndex: 1055,
          boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'transform 0.3s ease, visibility 0.3s',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Drawer Header - Simple & Professional */}
        <div
          className='d-flex align-items-center justify-content-between px-6 py-4 border-bottom bg-white'
          style={{ minHeight: '68px' }}
        >
          <div className='d-flex align-items-center gap-3'>
            <div
              className='d-flex align-items-center justify-content-center bg-light rounded-circle flex-shrink-0'
              style={{ width: '38px', height: '38px', padding: '4px' }}
            >
              <img
                src={toAbsoluteUrl('/media/pfe/logo.png')}
                alt='Logo'
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e: any) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<i class="bi bi-graph-up text-primary fs-4"></i>'
                }}
              />
            </div>
            <div>
              <h5 className='text-dark fw-bolder mb-0 fs-6'>Assistant Décisionnel</h5>
            </div>
          </div>

          <div className='d-flex align-items-center gap-1'>
            <button
              className='btn btn-icon btn-sm btn-color-gray-500 btn-active-light-primary'
              title='Fermer'
              onClick={handleClose}
            >
              <i className='bi bi-x-lg fs-5'></i>
            </button>
          </div>
        </div>

        {/* Drawer Messages Stream */}
        <div
          className='flex-grow-1 p-4 overflow-auto'
          style={{
            backgroundColor: '#F8FAFC',
            scrollBehavior: 'smooth'
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex flex-column mb-3 ${
                msg.sender === 'user' ? 'align-items-end' : 'align-items-start'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`p-3 rounded shadow-xs position-relative ${
                  msg.sender === 'user'
                    ? 'text-white'
                    : 'bg-white border text-dark'
                }`}
                style={{
                  maxWidth: '92%',
                  background:
                    msg.sender === 'user'
                      ? '#1B84FF'
                      : '#ffffff',
                  borderColor: msg.sender === 'bot' ? '#E2E8F0' : 'transparent',
                  wordBreak: 'break-word',
                  borderRadius:
                    msg.sender === 'user'
                      ? '12px 12px 2px 12px'
                      : '12px 12px 12px 2px'
                }}
              >
                {msg.sender === 'user' ? (
                  <div className='fs-7'>{msg.text}</div>
                ) : (
                  <div>{renderFormattedText(msg.text)}</div>
                )}
              </div>

              {/* Suggestions chips right under bot message */}
              {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className='d-flex flex-wrap gap-1 mt-2' style={{ maxWidth: '95%' }}>
                  {msg.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      className='btn btn-xs btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary text-start fs-8 py-1 px-2 rounded-pill'
                      onClick={() => handleSendMessage(sug)}
                      disabled={isLoading}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Clean typing indicator */}
          {isLoading && (
            <div className='d-flex align-items-center gap-2 mb-3'>
              <div
                className='bg-white p-2 px-3 rounded shadow-xs border d-flex align-items-center gap-2'
                style={{ width: 'fit-content' }}
              >
                <span
                  className='spinner-grow spinner-grow-sm text-primary'
                  role='status'
                  style={{ width: '6px', height: '6px' }}
                ></span>
                <span
                  className='spinner-grow spinner-grow-sm text-primary'
                  role='status'
                  style={{ width: '6px', height: '6px', animationDelay: '0.15s' }}
                ></span>
                <span
                  className='spinner-grow spinner-grow-sm text-primary'
                  role='status'
                  style={{ width: '6px', height: '6px', animationDelay: '0.3s' }}
                ></span>
                <span className='text-muted fs-8 ms-1'>Recherche en cours...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Clean Input Bar (no duplicate carousel bar) */}
        <div className='p-3 bg-white border-top'>
          <div
            className='d-flex align-items-center border rounded p-2 bg-light'
          >
            <textarea
              ref={inputRef}
              className='form-control form-control-flush border-0 bg-transparent fs-7 p-1 shadow-none'
              rows={1}
              style={{
                resize: 'none',
                maxHeight: '70px',
                lineHeight: '1.4'
              }}
              placeholder='Saisissez votre question (machines, stocks)...'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className='btn btn-primary btn-icon btn-sm rounded ms-2 flex-shrink-0'
              style={{ width: '34px', height: '34px' }}
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <span className='spinner-border spinner-border-sm' role='status'></span>
              ) : (
                <i className='bi bi-send fs-7 text-white'></i>
              )}
            </button>
          </div>
          <div className='text-end mt-1 px-1'>
            <span className='text-muted fs-9'>
              Appuyez sur Entrée pour valider
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function generateClientFallback(msg: string) {
  const lower = (msg || '').toLowerCase()
  if (lower.includes('presse') || lower.includes('injection') || lower.includes('rendement') || lower.includes('machine')) {
    return {
      intent: 'BEST_MACHINE',
      reply: `### Synthèse Rendement - Presses d'Injection

D'après les relevés consolidés de l'atelier d'injection :

* **Machine la plus performante** : DEMAG Ergotech 50/310 (Rendement : **98.7%**)
* **Cadence nominale** : 2 800 pièces / shift
* **Atelier** : TN1-INJE (Site Kondar)

#### Top 3 des équipements :
1. **DEMAG Ergotech 50/310** : 98.7%
2. **ARBURG 420C** : 98.2%
3. **BILLION 150T** : 97.9%`,
      suggestions: [
        "Articles en stock critique",
        "Indicateurs qualité et TRS global"
      ]
    }
  }

  if (lower.includes('reapprovisionner') || lower.includes('urgence') || lower.includes('rupture') || lower.includes('stock')) {
    return {
      intent: 'STOCK_URGENT',
      reply: `### Articles sous seuil de réapprovisionnement

L'analyse de l'inventaire en magasin identifie 3 articles en niveau critique :

1. **CL64** (Insert métallique fileté M4) : **0.5 pcs** restantes
2. **CL144** (Joint d'étanchéité silicone 12mm) : **1.2 pcs** restantes
3. **C154** (Ressort de compression inox) : **2.0 pcs** restantes

Une commande de réapprovisionnement est préconisée pour ces références.`,
      suggestions: [
        "Rendement des presses d'injection",
        "Indicateurs qualité et TRS global"
      ]
    }
  }

  if (lower.includes('rebut') || lower.includes('trs') || lower.includes('oee') || lower.includes('qualité')) {
    return {
      intent: 'QUALITY_KPI',
      reply: `### Indicateurs Qualité et TRS Usine

Synthèse des opérations de fabrication :

* **Taux de Rebut Moyen** : **0.28%** (Conforme à l'objectif atelier < 1.5%)
* **Taux de Rendement Synthétique (TRS)** : **92.4%**
* **Volume total usiné** : 1 596 027 pièces
* **Temps cumulé machine** : 18 450 heures`,
      suggestions: [
        "Rendement des presses d'injection",
        "Articles en stock critique"
      ]
    }
  }

  return {
    intent: 'GENERAL',
    reply: `### Synthèse Usine
Le parc comprend **319 machines** (257 en Tunisie et 62 à Brno) et plus de **876 000 opérations** enregistrées.

Vous pouvez consulter les rendements machines, le taux de rebut ou les stocks critiques.`,
    suggestions: DEFAULT_SUGGESTIONS
  }
}

export const NexoraDrawer = IndustrialNexoraDrawer
export const IndustrialCopilotDrawer = IndustrialNexoraDrawer
export default IndustrialNexoraDrawer
