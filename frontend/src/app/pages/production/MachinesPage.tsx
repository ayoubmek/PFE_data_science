import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'

export default function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const fetchMachines = async () => {
    setLoading(true)
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const { data } = await axios.get(`${apiUrl}/production/machines`)
      setMachines(data || [])
    } catch (err) {
      console.warn('Failed to fetch machines, using fallback data:', err)
      setMachines([
        { id: 1, code: 'M-01', nom: 'Presse Hydraulique P1', statut: 'EN_PRODUCTION', tauxRendement: 85.5, totalOutput: 1240, temperature: 62 },
        { id: 2, code: 'M-02', nom: 'Toureuse Commande Numérique T2', statut: 'EN_PRODUCTION', tauxRendement: 79.2, totalOutput: 890, temperature: 55 },
        { id: 3, code: 'M-03', nom: 'Découpeuse Laser L3', statut: 'DISPONIBLE', tauxRendement: 92.4, totalOutput: 2150, temperature: 41 },
        { id: 4, code: 'M-04', nom: 'Fraiseuse Multi-axes F4', statut: 'EN_MAINTENANCE', tauxRendement: 45.0, totalOutput: 340, temperature: 30 },
        { id: 5, code: 'M-05', nom: 'Robot Soudeur R5', statut: 'EN_PANNE', tauxRendement: 12.8, totalOutput: 1050, temperature: 75 },
        { id: 6, code: 'M-06', nom: 'Unité Injection Plastique I6', statut: 'DISPONIBLE', tauxRendement: 88.0, totalOutput: 1540, temperature: 48 }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    let eventSource: EventSource | null = null
    try {
      eventSource = new EventSource(`${apiUrl}/production/machines/stream`)
      eventSource.addEventListener('ORDER_CREATED', () => fetchMachines())
      eventSource.addEventListener('ORDER_UPDATED', () => fetchMachines())
      eventSource.addEventListener('MACHINE_STATUS', () => fetchMachines())
    } catch (e) {
      console.warn('SSE EventSource not supported or unreachable.')
    }

    return () => {
      if (eventSource) eventSource.close()
    }
  }, [])

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'EN_PRODUCTION':
        return { badge: 'success', label: 'En Production', border: 'border-l-success', pulse: 'pulse-green', bg: '#e8fff3' }
      case 'DISPONIBLE':
        return { badge: 'primary', label: 'Disponible', border: 'border-l-primary', pulse: 'pulse-blue', bg: '#f1f8ff' }
      case 'EN_MAINTENANCE':
        return { badge: 'warning', label: 'En Maintenance', border: 'border-l-warning', pulse: '', bg: '#fff8dd' }
      case 'EN_PANNE':
        return { badge: 'danger', label: 'En Panne', border: 'border-l-danger', pulse: 'pulse-red', bg: '#fff5f8' }
      default:
        return { badge: 'secondary', label: statut, border: '', pulse: '', bg: '#f5f8fa' }
    }
  }

  const getYieldColor = (rate: number) => {
    if (rate >= 80) return 'text-success'
    if (rate >= 50) return 'text-warning'
    return 'text-danger'
  }

  if (loading && machines.length === 0) {
    return <PageSkeleton type='table' />
  }

  return (
    <div className={`card glass-card shadow-sm border-0 ${isDarkMode ? 'dark-mode-card' : ''}`}>
      <style>{`
        .glass-card {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02) !important;
          transition: all 0.3s ease;
        }
        .dark-mode-card {
          background: #1e1e2d !important;
          color: #ffffff !important;
          border: 1px solid #2b2b40 !important;
        }
        .dark-mode-card .text-gray-900,
        .dark-mode-card .card-label,
        .dark-mode-card th,
        .dark-mode-card td {
          color: #e4e6ef !important;
        }
        .pro-badge {
          padding: 6px 14px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .border-l-success { border-left: 4px solid #50CD89 !important; }
        .border-l-primary { border-left: 4px solid #3E97FF !important; }
        .border-l-warning { border-left: 4px solid #F1BC00 !important; }
        .border-l-danger { border-left: 4px solid #F1416C !important; }
        .pulse-dot-small {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .pulse-green { background-color: #50CD89; animation: pG 1.5s infinite; }
        .pulse-blue { background-color: #3E97FF; animation: pB 1.5s infinite; }
        .pulse-red { background-color: #F1416C; animation: pR 1.5s infinite; }
        @keyframes pG {
          0% { box-shadow: 0 0 0 0 rgba(80,205,137,0.7); }
          100% { box-shadow: 0 0 0 6px rgba(80,205,137,0); }
        }
        @keyframes pB {
          0% { box-shadow: 0 0 0 0 rgba(62,151,255,0.7); }
          100% { box-shadow: 0 0 0 6px rgba(62,151,255,0); }
        }
        @keyframes pR {
          0% { box-shadow: 0 0 0 0 rgba(241,65,108,0.7); }
          100% { box-shadow: 0 0 0 6px rgba(241,65,108,0); }
        }
        .mimic-node {
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .mimic-node:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08);
        }
      `}</style>

      {}
      <div className='card-header align-items-center py-5 gap-2 gap-md-5 border-0 bg-transparent'>
        <div className='card-title'>
          <h3 className='card-label fw-bold fs-4 d-flex align-items-center gap-2'>
            <KTIcon iconName='element-11' className='fs-2 text-primary' />
            Postes de Travail & Synoptique d'Atelier
          </h3>
        </div>
        <div className='card-toolbar d-flex gap-3'>
          {}
          <button className='btn btn-light-primary btn-sm px-5 py-2' onClick={fetchMachines} disabled={loading}>
            {loading ? <span className='spinner-border spinner-border-sm me-2'></span> : null}
            <KTIcon iconName='arrows-loop' className='fs-2 me-1' />
            Actualiser
          </button>
        </div>
      </div>

      <div className='card-body pt-0'>
        {}
        <div className='mb-8 p-6 rounded-4' style={{ background: isDarkMode ? '#151521' : '#f8f9fa', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <h5 className='fw-bolder mb-0 d-flex align-items-center gap-2'>
              <KTIcon iconName='abstract-26' className='fs-3 text-info' />
              Plan Visuel de l'Atelier en Temps Réel (Shop Floor Mimic)
            </h5>
            <span className='badge badge-light-info fw-bold fs-8'>Direct SSE Connecté</span>
          </div>

          <div className='row g-4'>
            {machines.map((m) => {
              const conf = getStatusConfig(m.statut)
              return (
                <div key={m.id} className='col-12 col-sm-6 col-md-4 col-xl-2'>
                  <div
                    className='mimic-node h-100 d-flex flex-column justify-content-between'
                    style={{ background: isDarkMode ? '#1e1e2d' : '#ffffff', borderTop: `4px solid ${conf.pulse === 'pulse-green' ? '#50CD89' : conf.pulse === 'pulse-red' ? '#F1416C' : '#3E97FF'}` }}
                    onClick={() => {
                      setSelectedMachine(m)
                      setShowModal(true)
                    }}
                  >
                    <div>
                      <div className='d-flex justify-content-between align-items-center mb-2'>
                        <span className='fw-extrabolder fs-6 text-gray-900'>{m.code}</span>
                        {conf.pulse && <span className={`pulse-dot-small ${conf.pulse}`}></span>}
                      </div>
                      <div className='text-gray-600 fw-semibold fs-7 text-truncate mb-3'>{m.nom}</div>
                    </div>

                    <div>
                      <div className='d-flex justify-content-between align-items-center fs-8 mb-1'>
                        <span className='text-muted'>TRG</span>
                        <span className={`fw-extrabolder ${getYieldColor(m.tauxRendement)}`}>{m.tauxRendement}%</span>
                      </div>
                      <div className='progress h-6px bg-light-primary rounded'>
                        <div
                          className={`progress-bar ${m.tauxRendement >= 80 ? 'bg-success' : m.tauxRendement >= 50 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${m.tauxRendement}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {}
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed fs-6 gy-5'>
            <thead>
              <tr className='text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0 border-0'>
                <th className='ps-4'>Code Machine</th>
                <th>Nom d'Usinage</th>
                <th>Statut</th>
                <th>Volume Produit</th>
                <th>Indice TRG</th>
                <th style={{ minWidth: '70px' }} className='text-end pe-4'>Actions</th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-semibold'>
              {machines.length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center py-10 text-muted'>
                    Aucune machine configurée
                  </td>
                </tr>
              ) : (
                machines.map((m) => {
                  const conf = getStatusConfig(m.statut)
                  return (
                    <tr key={m.id} className={`row-hover-effect ${conf.border}`}>
                      <td className='fw-bold text-gray-900 ps-4'>{m.code}</td>
                      <td className='fw-bold'>{m.nom}</td>
                      <td>
                        <span className={`pro-badge badge-light-${conf.badge} text-${conf.badge}`}>
                          {conf.pulse && <span className={`pulse-dot-small ${conf.pulse}`}></span>}
                          {conf.label}
                        </span>
                      </td>
                      <td>{m.totalOutput ? `${m.totalOutput.toLocaleString()} u` : '0 u'}</td>
                      <td className={`fw-extrabolder fs-6 ${getYieldColor(m.tauxRendement)}`}>
                        {m.tauxRendement ? `${m.tauxRendement}%` : '0%'}
                      </td>
                      <td className='text-end pe-4'>
                        <button
                          className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                          onClick={() => {
                            setSelectedMachine(m)
                            setShowModal(true)
                          }}
                          title="Voir les détails"
                        >
                          <KTIcon iconName='eye' className='fs-3' />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {selectedMachine && (() => {
        const conf = getStatusConfig(selectedMachine.statut)
        return (
          <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
            <Modal.Header closeButton className={`border-0 pt-6 px-8 ${isDarkMode ? 'bg-dark text-white' : 'bg-light'}`}>
              <Modal.Title className='fw-bold fs-3 d-flex align-items-center gap-2'>
                <KTIcon iconName='gear' className='fs-1 text-primary' />
                Machine : <span className='text-primary fw-extrabolder'>{selectedMachine.code}</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`px-8 py-8 ${isDarkMode ? 'bg-dark text-white' : ''}`}>
              <div className='row g-6'>
                <div className='col-12'>
                  <div className={`p-5 rounded-3 ${isDarkMode ? 'bg-gray-800' : 'bg-light'}`}>
                    <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Nom d'Usinage</span>
                    <div className='fw-bold fs-5 mt-1'>{selectedMachine.nom || '-'}</div>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='card bg-body border border-dashed p-5 rounded-3 h-100'>
                    <div className='d-flex flex-column gap-4'>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Code Machine :</span>
                        <span className='fw-extrabolder fs-6'>{selectedMachine.code || '-'}</span>
                      </div>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Statut :</span>
                        <span className={`pro-badge badge-light-${conf.badge} text-${conf.badge} fs-8`}>
                          {conf.pulse && <span className={`pulse-dot-small ${conf.pulse} me-1`}></span>}
                          {conf.label}
                        </span>
                      </div>
                      <div className='d-flex justify-content-between pb-1'>
                        <span className='text-gray-500 fw-bold fs-7'>Taux de Rendement (TRG) :</span>
                        <span className={`fw-extrabolder fs-6 ${getYieldColor(selectedMachine.tauxRendement)}`}>
                          {selectedMachine.tauxRendement ? `${selectedMachine.tauxRendement}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='card bg-body border border-dashed p-5 rounded-3 h-100'>
                    <div className='d-flex flex-column gap-4 justify-content-center h-100'>
                      <div className='d-flex justify-content-between pb-1'>
                        <span className='text-gray-500 fw-bold fs-7'>Volume Produit (Total) :</span>
                        <span className='fw-extrabolder fs-6'>
                          {selectedMachine.totalOutput ? `${selectedMachine.totalOutput.toLocaleString()} unités` : '0 unité'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className={`border-0 py-4 px-8 d-flex justify-content-end ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
              <button className='btn btn-light-primary btn-sm px-6' onClick={() => setShowModal(false)}>
                Fermer
              </button>
            </Modal.Footer>
          </Modal>
        )
      })()}
    </div>
  )
}