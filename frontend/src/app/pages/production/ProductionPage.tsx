import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'
import * as XLSX from 'xlsx'

export default function ProductionPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortField, setSortField] = useState('dateDebut')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [showFilters, setShowFilters] = useState(false)

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${apiUrl}/production/orders`)
      const mapped = (data || []).map((o: any) => ({
        id: o.id,
        code: o.reference || o.code,
        articleNom: o.article || o.articleNom,
        quantiteObjectif: o.quantitePrevue !== undefined ? o.quantitePrevue : o.quantiteObjectif,
        quantiteProduite: o.quantiteRealisee !== undefined ? o.quantiteRealisee : o.quantiteProduite,
        statut: o.statut,
        dateDebut: o.dateDebut,
        dateFin: o.dateFin,
        machineNom: o.machineNom,
        responsable: o.responsable,
        notes: o.notes,
        tauxRendement: o.tauxRendement,
      }))
      setOrders(mapped)
    } catch {
      setOrders([
        { id: 1, code: 'OF-2026-001', articleNom: 'Axe Cylindrique A1', quantiteObjectif: 500, quantiteProduite: 500, statut: 'TERMINE', dateDebut: '2026-07-10', responsable: 'Atelier U1' },
        { id: 2, code: 'OF-2026-002', articleNom: 'Support Moteur M2', quantiteObjectif: 300, quantiteProduite: 120, statut: 'EN_COURS', dateDebut: '2026-07-15', responsable: 'Atelier U2' },
        { id: 3, code: 'OF-2026-003', articleNom: 'Boulon Taraudé B8', quantiteObjectif: 1000, quantiteProduite: 0, statut: 'PLANIFIE', dateDebut: '2026-07-20', responsable: 'Atelier U1' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, statusFilter, dateFrom, dateTo, sortField, sortDir, rowsPerPage])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'TERMINE': return { color: 'success', label: 'Terminé' }
      case 'EN_COURS': return { color: 'primary', label: 'En cours' }
      case 'PLANIFIE':
      case 'EN_ATTENTE': return { color: 'warning', label: 'Planifié' }
      case 'EN_RETARD': return { color: 'danger', label: 'En retard' }
      default: return { color: 'info', label: status || 'Autre' }
    }
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

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      const s = searchTerm.toLowerCase()
      const matchSearch = !s || o.code?.toLowerCase().includes(s) || o.articleNom?.toLowerCase().includes(s) || o.responsable?.toLowerCase().includes(s)
      const matchStatus = statusFilter === 'ALL' || o.statut === statusFilter
      const matchFrom = !dateFrom || (o.dateDebut && o.dateDebut >= dateFrom)
      const matchTo = !dateTo || (o.dateDebut && o.dateDebut <= dateTo)
      return matchSearch && matchStatus && matchFrom && matchTo
    })
    result.sort((a, b) => {
      const va = a[sortField] ?? '', vb = b[sortField] ?? ''
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return result
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo, sortField, sortDir])

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage) || 1
  const start = (currentPage - 1) * rowsPerPage
  const currentOrders = filteredOrders.slice(start, start + rowsPerPage)

  const stats = useMemo(() => ({
    total: orders.length,
    termine: orders.filter(o => o.statut === 'TERMINE').length,
    enCours: orders.filter(o => o.statut === 'EN_COURS').length,
    planifie: orders.filter(o => ['PLANIFIE', 'EN_ATTENTE'].includes(o.statut)).length,
    retard: orders.filter(o => o.statut === 'EN_RETARD').length,
  }), [orders])

  const activeFilters = [searchTerm, statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const exportExcel = () => {
    const rows = filteredOrders.map(o => ({
      'Code OF': o.code,
      'Article': o.articleNom,
      'Volume Cible': o.quantiteObjectif,
      'Volume Réalisé': o.quantiteProduite,
      'Progression (%)': Math.min(100, Math.round(((o.quantiteProduite || 0) / (o.quantiteObjectif || 1)) * 100)),
      'Statut': getStatusInfo(o.statut).label,
      'Date Début': o.dateDebut,
      'Machine': o.machineNom || '',
      'Responsable': o.responsable || '',
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [18, 35, 15, 15, 14, 12, 14, 20, 16].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, 'Production')
    XLSX.writeFile(wb, `production_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (loading && orders.length === 0) return <PageSkeleton type='table' />

  return (
    <div className='card card-flush'>

      {/* ── KPI STATS ROW ── */}
      <div className='card-header border-0 pt-6 pb-0'>
        <div className='d-flex gap-4 flex-wrap'>
          {[
            { label: 'Total OFs', val: stats.total, color: 'primary', icon: 'abstract-26' },
            { label: 'Terminés', val: stats.termine, color: 'success', icon: 'check-circle' },
            { label: 'En cours', val: stats.enCours, color: 'info', icon: 'time' },
            { label: 'Planifiés', val: stats.planifie, color: 'warning', icon: 'calendar' },
            { label: 'En retard', val: stats.retard, color: 'danger', icon: 'warning-2' },
          ].map(s => (
            <div key={s.label} className='d-flex align-items-center gap-2 bg-light-subtle rounded px-4 py-2'>
              <span className={`badge badge-circle badge-light-${s.color} p-4`}>
                <KTIcon iconName={s.icon} className={`fs-3 text-${s.color}`} />
              </span>
              <div>
                <div className={`fw-bolder fs-4 text-${s.color}`}>{s.val}</div>
                <div className='text-muted fs-8 fw-semibold'>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className='card-header border-0 pt-4 pb-2'>
        <div className='card-title'>
          <div className='d-flex align-items-center position-relative my-1'>
            <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-4 text-gray-400' />
            <input
              type='text'
              className='form-control form-control-solid w-250px ps-14'
              placeholder='Code OF, article, atelier...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className='card-toolbar gap-2 flex-wrap'>
          {/* Rows per page */}
          <select
            className='form-select form-select-solid form-select-sm w-auto'
            value={rowsPerPage}
            onChange={e => setRowsPerPage(Number(e.target.value))}
          >
            {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n} lignes</option>)}
          </select>

          {/* Filters toggle */}
          <button
            type='button'
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-light-primary'}`}
            onClick={() => setShowFilters(v => !v)}
          >
            <KTIcon iconName='filter' className='fs-3 me-1' />
            Filtres
            {activeFilters > 0 && (
              <span className='badge badge-circle badge-danger ms-2' style={{ fontSize: 9, width: 16, height: 16 }}>
                {activeFilters}
              </span>
            )}
          </button>

          {activeFilters > 0 && (
            <button
              type='button'
              className='btn btn-sm btn-light-danger'
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }}
            >
              <KTIcon iconName='cross-circle' className='fs-3 me-1' />
              Réinitialiser
            </button>
          )}

          {/* Export Excel */}
          <button type='button' className='btn btn-sm btn-light-success' onClick={exportExcel}>
            <KTIcon iconName='exit-up' className='fs-3 me-1' />
            Excel ({filteredOrders.length})
          </button>

          {/* Refresh */}
          <button type='button' className='btn btn-sm btn-light-primary' onClick={fetchOrders} disabled={loading}>
            {loading
              ? <span className='spinner-border spinner-border-sm me-2' />
              : <KTIcon iconName='arrows-loop' className='fs-3 me-1' />
            }
            Actualiser
          </button>
        </div>
      </div>

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <div className='card-header border-0 pt-0 pb-3'>
          <div className='d-flex flex-wrap gap-4 align-items-end bg-light rounded p-4 w-100'>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Statut</label>
              <select
                className='form-select form-select-solid form-select-sm'
                style={{ width: 160 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value='ALL'>Tous les statuts</option>
                <option value='TERMINE'>Terminé</option>
                <option value='EN_COURS'>En cours</option>
                <option value='PLANIFIE'>Planifié</option>
                <option value='EN_ATTENTE'>En attente</option>
                <option value='EN_RETARD'>En retard</option>
              </select>
            </div>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Date début — de</label>
              <input
                type='date'
                className='form-control form-control-solid form-control-sm'
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Date début — à</label>
              <input
                type='date'
                className='form-control form-control-solid form-control-sm'
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <div className='ms-auto d-flex align-items-end'>
              <span className='text-muted fs-7'><strong className='text-primary'>{filteredOrders.length}</strong> résultat(s)</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className='card-body pt-0'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed table-hover fs-7 gy-2'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='ps-4 cursor-pointer user-select-none' onClick={() => handleSort('code')}>
                  Code OF <SortIcon field='code' />
                </th>
                <th className='cursor-pointer user-select-none min-w-150px' onClick={() => handleSort('articleNom')}>
                  Article <SortIcon field='articleNom' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('quantiteObjectif')}>
                  Cible <SortIcon field='quantiteObjectif' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('quantiteProduite')}>
                  Réalisé <SortIcon field='quantiteProduite' />
                </th>
                <th className='min-w-100px'>Progression</th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('statut')}>
                  Statut <SortIcon field='statut' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('dateDebut')}>
                  Date <SortIcon field='dateDebut' />
                </th>
                <th className='text-end pe-4'>Actions</th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-semibold'>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-center py-10'>
                    <KTIcon iconName='search-list' className='fs-2x text-gray-300 d-block mb-2' />
                    <span className='text-muted fs-6'>Aucun ordre de fabrication trouvé</span>
                  </td>
                </tr>
              ) : currentOrders.map(o => {
                const pct = Math.min(100, Math.round(((o.quantiteProduite || 0) / (o.quantiteObjectif || 1)) * 100))
                const si = getStatusInfo(o.statut)
                return (
                  <tr key={o.id}>
                    <td className='ps-4 fw-bold text-gray-800'>{o.code}</td>
                    <td className='text-gray-700'>{o.articleNom}</td>
                    <td className='text-gray-600'>{(o.quantiteObjectif || 0).toLocaleString()}</td>
                    <td className='text-gray-600'>{(o.quantiteProduite || 0).toLocaleString()}</td>
                    <td className='min-w-100px'>
                      <div className='d-flex align-items-center gap-2'>
                        <span className={`text-${pct >= 100 ? 'success' : 'primary'} fw-bold fs-8`} style={{ minWidth: 30 }}>
                          {pct}%
                        </span>
                        <div className='progress h-6px w-100px bg-secondary'>
                          <div
                            className={`progress-bar bg-${pct >= 100 ? 'success' : 'primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-light-${si.color}`}>{si.label}</span>
                    </td>
                    <td className='text-muted'>{o.dateDebut}</td>
                    <td className='text-end pe-4'>
                      <button
                        type='button'
                        className='btn btn-icon btn-light btn-active-light-primary btn-sm'
                        title='Voir les détails'
                        onClick={() => { setSelectedOrder(o); setShowModal(true) }}
                      >
                        <KTIcon iconName='eye' className='fs-4' />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 pt-4 border-top'>
          <div className='text-muted fs-7'>
            Affichage de{' '}
            <strong className='text-gray-800'>{filteredOrders.length === 0 ? 0 : start + 1}</strong> à{' '}
            <strong className='text-gray-800'>{Math.min(start + rowsPerPage, filteredOrders.length)}</strong> sur{' '}
            <strong className='text-primary'>{filteredOrders.length}</strong> ordres
          </div>
          <ul className='pagination pagination-outline'>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className='page-link' onClick={() => setCurrentPage(1)}>«</button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className='page-link' onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>‹</button>
            </li>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = currentPage <= 3 ? i + 1 : currentPage + i - 2
              if (p > totalPages) return null
              return (
                <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                  <button className='page-link' onClick={() => setCurrentPage(p)}>{p}</button>
                </li>
              )
            })}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className='page-link' onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>›</button>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className='page-link' onClick={() => setCurrentPage(totalPages)}>»</button>
            </li>
          </ul>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title className='fw-bold fs-5'>
            Détails — <span className='text-primary'>{selectedOrder?.code}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (() => {
            const pct = Math.min(100, Math.round(((selectedOrder.quantiteProduite || 0) / (selectedOrder.quantiteObjectif || 1)) * 100))
            const si = getStatusInfo(selectedOrder.statut)
            return (
              <div>
                <div className='mb-5'>
                  <div className='d-flex justify-content-between fs-7 fw-semibold text-gray-600 mb-2'>
                    <span>Progression de production</span>
                    <span className={`text-${pct >= 100 ? 'success' : 'primary'} fw-bold`}>{pct}%</span>
                  </div>
                  <div className='progress h-8px'>
                    <div className={`progress-bar bg-${pct >= 100 ? 'success' : 'primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className='d-flex justify-content-between text-muted fs-8 mt-1'>
                    <span>Produit : {selectedOrder.quantiteProduite?.toLocaleString()}</span>
                    <span>Objectif : {selectedOrder.quantiteObjectif?.toLocaleString()}</span>
                  </div>
                </div>
                <div className='separator separator-dashed mb-5' />
                <div className='row g-4'>
                  {[
                    { label: 'Statut', val: <span className={`badge badge-light-${si.color}`}>{si.label}</span> },
                    { label: 'Date début', val: selectedOrder.dateDebut || '—' },
                    { label: 'Date fin', val: selectedOrder.dateFin || '—' },
                    { label: 'Machine / Poste', val: selectedOrder.machineNom || '—' },
                    { label: 'Responsable', val: selectedOrder.responsable || '—' },
                    { label: 'Taux rendement', val: selectedOrder.tauxRendement ? `${selectedOrder.tauxRendement}%` : '—' },
                  ].map(({ label, val }) => (
                    <div className='col-md-6' key={label}>
                      <div className='fs-8 text-muted fw-semibold mb-1'>{label}</div>
                      <div className='fs-7 fw-bold text-gray-800'>{val}</div>
                    </div>
                  ))}
                  {selectedOrder.notes && (
                    <div className='col-12'>
                      <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed p-4'>
                        <KTIcon iconName='information-5' className='fs-2tx text-warning me-4' />
                        <div className='fs-7 text-gray-700'>{selectedOrder.notes}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </Modal.Body>
        <Modal.Footer>
          <button type='button' className='btn btn-sm btn-light' onClick={() => setShowModal(false)}>Fermer</button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
