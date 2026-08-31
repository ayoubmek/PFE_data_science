import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'
import * as XLSX from 'xlsx'

let globalCachedMachines: any[] = []

export default function MachinesPage() {
  const [machines, setMachines] = useState<any[]>(globalCachedMachines)
  const [loading, setLoading] = useState(globalCachedMachines.length === 0)
  const [searchTerm, setSearchTerm] = useState('')
  const [workshopFilter, setWorkshopFilter] = useState('ALL')
  const [siteFilter, setSiteFilter] = useState('ALL')
  const [sortField, setSortField] = useState('totalOutput')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedMachine, setSelectedMachine] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [showFilters, setShowFilters] = useState(false)

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

  const fetchMachines = async () => {
    if (globalCachedMachines.length === 0) setLoading(true)
    try {
      const { data } = await axios.get(`${apiUrl}/production/machines`)
      const list = Array.isArray(data) ? data : []
      globalCachedMachines = list
      setMachines(list)
    } catch (err) {
      console.error('Failed to fetch machines from API:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, workshopFilter, siteFilter, sortField, sortDir, rowsPerPage])

  const workshops = useMemo(() => ['ALL', ...Array.from(new Set(machines.map(m => m.workCenter).filter(Boolean)))], [machines])
  const sites = useMemo(() => ['ALL', ...Array.from(new Set(machines.map(m => m.emplacement).filter(Boolean)))], [machines])

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'EN_PRODUCTION':
        return { badge: 'success', label: 'En Production', border: 'border-l-success', pulse: 'pulse-green' }
      case 'DISPONIBLE':
        return { badge: 'primary', label: 'Disponible', border: 'border-l-primary', pulse: 'pulse-blue' }
      case 'EN_MAINTENANCE':
        return { badge: 'warning', label: 'En Maintenance', border: 'border-l-warning', pulse: '' }
      case 'EN_PANNE':
        return { badge: 'danger', label: 'En Panne', border: 'border-l-danger', pulse: 'pulse-red' }
      default:
        return { badge: 'secondary', label: statut || 'Disponible', border: '', pulse: '' }
    }
  }

  const getYieldColor = (rate: number) => {
    if (rate >= 80) return 'text-success'
    if (rate >= 50) return 'text-warning'
    return 'text-danger'
  }

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: string }) => (
    <span className='ms-1 text-gray-400' style={{ fontSize: 9 }}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  )

  const filteredMachines = useMemo(() => {
    let result = machines.filter(m => {
      const s = searchTerm.toLowerCase()
      const matchSearch = !s ||
        m.nom?.toLowerCase().includes(s) ||
        m.code?.toLowerCase().includes(s) ||
        m.workCenter?.toLowerCase().includes(s) ||
        m.family?.toLowerCase().includes(s) ||
        m.emplacement?.toLowerCase().includes(s)
      const matchWorkshop = workshopFilter === 'ALL' || m.workCenter === workshopFilter
      const matchSite = siteFilter === 'ALL' || m.emplacement === siteFilter
      return matchSearch && matchWorkshop && matchSite
    })

    result.sort((a, b) => {
      const va = a[sortField] ?? '', vb = b[sortField] ?? ''
      if (!isNaN(Number(va)) && !isNaN(Number(vb))) {
        return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va)
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return result
  }, [machines, searchTerm, workshopFilter, siteFilter, sortField, sortDir])

  const totalPages = Math.ceil(filteredMachines.length / rowsPerPage) || 1
  const start = (currentPage - 1) * rowsPerPage
  const currentMachines = filteredMachines.slice(start, start + rowsPerPage)

  const stats = useMemo(() => {
    const total = machines.length
    const totalVolume = machines.reduce((acc, m) => acc + (Number(m.totalOutput) || 0), 0)
    const avgTrg = total > 0 ? (machines.reduce((acc, m) => acc + (Number(m.tauxRendement) || 0), 0) / total) : 100
    const nbAteliers = new Set(machines.map(m => m.workCenter).filter(Boolean)).size
    return {
      total,
      totalVolume,
      avgTrg: Math.round(avgTrg * 10) / 10,
      nbAteliers
    }
  }, [machines])

  const exportExcel = () => {
    const rows = filteredMachines.map(m => ({
      'Code Machine': m.code,
      'Nom de la Machine': m.nom,
      'Atelier / Centre de Charge': m.workCenter,
      'Famille Machine': m.family,
      'Site': m.emplacement,
      'Statut': m.statut,
      'Volume Produit': Number(m.totalOutput) || 0,
      'Rebut Total': Number(m.totalScrap) || 0,
      'Taux TRG (%)': Number(m.tauxRendement) || 0,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Parc Machines')
    XLSX.writeFile(wb, `Parc_Machines_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (loading && machines.length === 0) {
    return <PageSkeleton type='table' />
  }

  return (
    <div className='d-flex flex-column gap-5'>
      {/* CSS Utilities */}
      <style>{`
        .glass-card {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02) !important;
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
        .pulse-dot-small {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .pulse-green { background-color: #50CD89; animation: pG 1.5s infinite; }
        .pulse-blue { background-color: #3E97FF; animation: pB 1.5s infinite; }
        .pulse-red { background-color: #F1416C; animation: pR 1.5s infinite; }
        @keyframes pG { 0% { box-shadow: 0 0 0 0 rgba(80,205,137,0.7); } 100% { box-shadow: 0 0 0 6px rgba(80,205,137,0); } }
        @keyframes pB { 0% { box-shadow: 0 0 0 0 rgba(62,151,255,0.7); } 100% { box-shadow: 0 0 0 6px rgba(62,151,255,0); } }
        @keyframes pR { 0% { box-shadow: 0 0 0 0 rgba(241,65,108,0.7); } 100% { box-shadow: 0 0 0 6px rgba(241,65,108,0); } }
      `}</style>

      {/* KPI Stats Cards */}
      <div className='row g-5'>
        <div className='col-xl-3 col-sm-6'>
          <div className='card card-flush bg-body shadow-sm h-100'>
            <div className='card-body d-flex align-items-center justify-content-between p-6'>
              <div>
                <div className='fs-2hx fw-bold text-gray-900'>{stats.total}</div>
                <div className='fs-7 fw-semibold text-gray-500 mt-1'>Machines Recensées</div>
              </div>
              <div className='badge badge-light-primary p-4 rounded-circle'>
                <KTIcon iconName='gear' className='fs-2x text-primary' />
              </div>
            </div>
          </div>
        </div>

        <div className='col-xl-3 col-sm-6'>
          <div className='card card-flush bg-body shadow-sm h-100'>
            <div className='card-body d-flex align-items-center justify-content-between p-6'>
              <div>
                <div className='fs-2hx fw-bold text-gray-900'>{stats.nbAteliers}</div>
                <div className='fs-7 fw-semibold text-gray-500 mt-1'>Ateliers / Centres de Charge</div>
              </div>
              <div className='badge badge-light-info p-4 rounded-circle'>
                <KTIcon iconName='element-11' className='fs-2x text-info' />
              </div>
            </div>
          </div>
        </div>

        <div className='col-xl-3 col-sm-6'>
          <div className='card card-flush bg-body shadow-sm h-100'>
            <div className='card-body d-flex align-items-center justify-content-between p-6'>
              <div>
                <div className='fs-2hx fw-bold text-success'>{stats.avgTrg}%</div>
                <div className='fs-7 fw-semibold text-gray-500 mt-1'>Taux TRG Moyen Global</div>
              </div>
              <div className='badge badge-light-success p-4 rounded-circle'>
                <KTIcon iconName='chart-line' className='fs-2x text-success' />
              </div>
            </div>
          </div>
        </div>

        <div className='col-xl-3 col-sm-6'>
          <div className='card card-flush bg-body shadow-sm h-100'>
            <div className='card-body d-flex align-items-center justify-content-between p-6'>
              <div>
                <div className='fs-2hx fw-bold text-gray-900'>{stats.totalVolume.toLocaleString()}</div>
                <div className='fs-7 fw-semibold text-gray-500 mt-1'>Volume Total Produit (u)</div>
              </div>
              <div className='badge badge-light-warning p-4 rounded-circle'>
                <KTIcon iconName='cube-3' className='fs-2x text-warning' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className='card glass-card shadow-sm border-0'>
        <div className='card-header align-items-center py-5 gap-2 gap-md-5 border-0 bg-transparent'>
          <div className='card-title'>
            <div className='d-flex align-items-center position-relative my-1'>
              <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-4' />
              <input
                type='text'
                className='form-control form-control-solid w-250px ps-12'
                placeholder='Rechercher machine, code...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className='card-toolbar d-flex gap-3'>
            <button
              type='button'
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-light-primary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <KTIcon iconName='filter' className='fs-4 me-1' />
              Filtres {((workshopFilter !== 'ALL' ? 1 : 0) + (siteFilter !== 'ALL' ? 1 : 0)) > 0 && `(${((workshopFilter !== 'ALL' ? 1 : 0) + (siteFilter !== 'ALL' ? 1 : 0))})`}
            </button>

            <button
              type='button'
              className='btn btn-sm btn-light-success'
              onClick={exportExcel}
            >
              <KTIcon iconName='file-down' className='fs-4 me-1' />
              Export Excel
            </button>

            <span className='badge badge-light-info fw-bold fs-8 d-flex align-items-center gap-2 py-2 px-3'>
              <span className='pulse-dot-small pulse-green'></span>
              Direct SSE
            </span>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className='card-body pt-0 pb-5'>
            <div className='p-4 rounded bg-light border d-flex flex-wrap gap-4 align-items-center'>
              <div className='d-flex flex-column gap-1' style={{ minWidth: 200 }}>
                <label className='form-label fs-7 fw-bold text-gray-700 mb-0'>Atelier (Centre de Charge) :</label>
                <select
                  className='form-select form-select-solid form-select-sm'
                  value={workshopFilter}
                  onChange={(e) => setWorkshopFilter(e.target.value)}
                >
                  {workshops.map(w => (
                    <option key={w} value={w}>{w === 'ALL' ? 'Tous les Ateliers' : w}</option>
                  ))}
                </select>
              </div>

              <div className='d-flex flex-column gap-1' style={{ minWidth: 160 }}>
                <label className='form-label fs-7 fw-bold text-gray-700 mb-0'>Site Géographique :</label>
                <select
                  className='form-select form-select-solid form-select-sm'
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                >
                  {sites.map(s => (
                    <option key={s} value={s}>{s === 'ALL' ? 'Tous les Sites' : s}</option>
                  ))}
                </select>
              </div>

              {(workshopFilter !== 'ALL' || siteFilter !== 'ALL' || searchTerm) && (
                <div className='align-self-end'>
                  <button
                    className='btn btn-sm btn-light-danger'
                    onClick={() => {
                      setWorkshopFilter('ALL')
                      setSiteFilter('ALL')
                      setSearchTerm('')
                    }}
                  >
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className='card-body pt-0'>
          <div className='table-responsive'>
            <table className='table align-middle table-row-dashed fs-6 gy-5'>
              <thead>
                <tr className='text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0 border-0'>
                  <th className='ps-4 cursor-pointer' onClick={() => handleSort('nom')}>
                    Machine & Marque <SortIcon field='nom' />
                  </th>
                  <th className='cursor-pointer' onClick={() => handleSort('workCenter')}>
                    Atelier / Centre de Charge <SortIcon field='workCenter' />
                  </th>
                  <th>Famille Machine</th>
                  <th>Site</th>
                  <th>Statut</th>
                  <th className='cursor-pointer' onClick={() => handleSort('totalOutput')}>
                    Volume Produit <SortIcon field='totalOutput' />
                  </th>
                  <th className='cursor-pointer' onClick={() => handleSort('tauxRendement')}>
                    Indice TRG <SortIcon field='tauxRendement' />
                  </th>
                  <th style={{ minWidth: '70px' }} className='text-end pe-4'>Actions</th>
                </tr>
              </thead>
              <tbody className='text-gray-600 fw-semibold'>
                {currentMachines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='text-center py-10 text-muted'>
                      Aucune machine trouvée pour ces critères
                    </td>
                  </tr>
                ) : (
                  currentMachines.map((m) => {
                    const conf = getStatusConfig(m.statut)
                    return (
                      <tr key={m.code || m.id} className='row-hover-effect'>
                        <td className='ps-4'>
                          <div className='d-flex flex-column'>
                            <span className='fw-bold text-gray-900 fs-6'>{m.nom}</span>
                            <span className='badge badge-light fw-bold text-muted w-fit mt-1' style={{ fontSize: 10 }}>
                              {m.code}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className='badge badge-light-primary fw-bolder fs-7 px-3 py-2'>
                            {m.workCenter || 'Atelier'}
                          </span>
                        </td>
                        <td className='text-gray-700 fs-7'>{m.family || 'Standard'}</td>
                        <td>
                          <span className='badge badge-light-dark fs-8'>{m.emplacement || 'Principal'}</span>
                        </td>
                        <td>
                          <span className={`pro-badge badge-light-${conf.badge} text-${conf.badge}`}>
                            {conf.pulse && <span className={`pulse-dot-small ${conf.pulse}`}></span>}
                            {conf.label}
                          </span>
                        </td>
                        <td className='fw-bold text-gray-800'>
                          {m.totalOutput ? `${m.totalOutput.toLocaleString()} u` : '0 u'}
                        </td>
                        <td>
                          <div className='d-flex align-items-center gap-2'>
                            <span className={`fw-extrabolder fs-6 ${getYieldColor(m.tauxRendement)}`}>
                              {m.tauxRendement ? `${m.tauxRendement}%` : '0%'}
                            </span>
                            <div className='progress h-4px w-60px bg-light rounded'>
                              <div
                                className={`progress-bar ${m.tauxRendement >= 80 ? 'bg-success' : m.tauxRendement >= 50 ? 'bg-warning' : 'bg-danger'}`}
                                style={{ width: `${m.tauxRendement}%` }}
                              ></div>
                            </div>
                          </div>
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

          {/* Pagination Controls */}
          {filteredMachines.length > 0 && (
            <div className='d-flex flex-stack flex-wrap pt-5 gap-3'>
              <div className='fs-7 fw-bold text-gray-700'>
                Affichage de {start + 1} à {Math.min(start + rowsPerPage, filteredMachines.length)} sur {filteredMachines.length} machines
              </div>
              <div className='d-flex align-items-center gap-3'>
                <div className='d-flex align-items-center gap-1'>
                  <span className='fs-7 text-muted'>Lignes par page :</span>
                  <select
                    className='form-select form-select-sm form-select-solid w-75px py-1'
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <ul className='pagination pagination-outline mb-0'>
                  <li className={`page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className='page-link' onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                    }
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button className='page-link' onClick={() => setCurrentPage(pageNum)}>
                          {pageNum}
                        </button>
                      </li>
                    )
                  })}
                  <li className={`page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className='page-link' onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                      &raquo;
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Machine Details Modal */}
      {selectedMachine && (() => {
        const conf = getStatusConfig(selectedMachine.statut)
        return (
          <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
            <Modal.Header closeButton className='border-0 pt-6 px-8 bg-light'>
              <Modal.Title className='fw-bold fs-3 d-flex align-items-center gap-2'>
                <KTIcon iconName='gear' className='fs-1 text-primary' />
                Détails Machine : <span className='text-primary fw-extrabolder'>{selectedMachine.nom}</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className='px-8 py-8'>
              <div className='row g-6'>
                <div className='col-12'>
                  <div className='p-5 rounded-3 bg-light d-flex justify-content-between align-items-center'>
                    <div>
                      <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Nom Commercial & Marque</span>
                      <div className='fw-bold fs-4 mt-1 text-gray-900'>{selectedMachine.nom}</div>
                    </div>
                    <span className='badge badge-light-primary fs-7 fw-bold px-4 py-2'>
                      Code : {selectedMachine.code}
                    </span>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='card bg-body border border-dashed p-5 rounded-3 h-100'>
                    <div className='d-flex flex-column gap-4'>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Atelier de Rattachement :</span>
                        <span className='fw-extrabolder fs-6 text-primary'>{selectedMachine.workCenter || '-'}</span>
                      </div>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Famille de Machine :</span>
                        <span className='fw-bold fs-6'>{selectedMachine.family || '-'}</span>
                      </div>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Site Industriel :</span>
                        <span className='badge badge-light-dark fs-8'>{selectedMachine.emplacement || 'Principal'}</span>
                      </div>
                      <div className='d-flex justify-content-between'>
                        <span className='text-gray-500 fw-bold fs-7'>Statut Opérationnel :</span>
                        <span className={`pro-badge badge-light-${conf.badge} text-${conf.badge} fs-8`}>
                          {conf.pulse && <span className={`pulse-dot-small ${conf.pulse} me-1`}></span>}
                          {conf.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='card bg-body border border-dashed p-5 rounded-3 h-100'>
                    <div className='d-flex flex-column gap-4 justify-content-center'>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Volume Produit Total :</span>
                        <span className='fw-extrabolder fs-6 text-success'>
                          {selectedMachine.totalOutput ? `${selectedMachine.totalOutput.toLocaleString()} unités` : '0 unité'}
                        </span>
                      </div>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Quantité Rebutée (Scrap) :</span>
                        <span className='fw-bold fs-6 text-danger'>
                          {selectedMachine.totalScrap ? `${selectedMachine.totalScrap.toLocaleString()} unités` : '0 unité'}
                        </span>
                      </div>
                      <div className='d-flex justify-content-between border-bottom pb-3'>
                        <span className='text-gray-500 fw-bold fs-7'>Nombre d'Opérations (OF) :</span>
                        <span className='fw-bold fs-6'>{selectedMachine.operationCount || 0}</span>
                      </div>
                      <div className='d-flex justify-content-between'>
                        <span className='text-gray-500 fw-bold fs-7'>Indice TRG / Rendement :</span>
                        <span className={`fw-extrabolder fs-5 ${getYieldColor(selectedMachine.tauxRendement)}`}>
                          {selectedMachine.tauxRendement ? `${selectedMachine.tauxRendement}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className='border-0 py-4 px-8 d-flex justify-content-end bg-light'>
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