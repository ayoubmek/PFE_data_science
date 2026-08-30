import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'
import * as XLSX from 'xlsx'

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedMovement, setSelectedMovement] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [showFilters, setShowFilters] = useState(false)
  const [months, setMonths] = useState(6)

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${apiUrl}/stock/movements/recent?months=${months}`)
      const mapped = (data || []).map((m: any) => ({
        id: m.id,
        date: m.date || m.dateCreation,
        itemReference: m.stockItemReference || m.itemReference,
        itemNom: m.stockItemDesignation || m.itemNom,
        type: m.type,
        quantite: m.quantite,
        operateur: m.operateur,
        motif: m.motif,
        reference: m.reference,
      }))
      setMovements(mapped)
    } catch {
      setMovements([
        { id: 1, date: '2026-07-18T10:15:30Z', itemReference: 'REF-AXE-01', itemNom: 'Axe Cylindrique A1', type: 'ENTREE', quantite: 150, operateur: 'Opérateur 1' },
        { id: 2, date: '2026-07-18T11:45:12Z', itemReference: 'REF-MOT-02', itemNom: 'Support Moteur M2', type: 'SORTIE', quantite: 30, operateur: 'Opérateur 2' },
        { id: 3, date: '2026-07-17T09:30:00Z', itemReference: 'REF-CHA-01', itemNom: 'Châssis Alu C1', type: 'SORTIE', quantite: 5, operateur: 'Opérateur 2' },
        { id: 4, date: '2026-07-16T08:20:00Z', itemReference: 'B0112XX', itemNom: 'BOITIER INJECTION T4', type: 'ENTREE', quantite: 600, operateur: 'Magasinier' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMovements() }, [months])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, typeFilter, dateFrom, dateTo, sortField, sortDir, rowsPerPage])

  const formatDateTime = (d: string) => {
    try {
      const dt = new Date(d)
      return `${dt.toLocaleDateString('fr-TN')} ${dt.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}`
    } catch { return d || '—' }
  }

  const getDatePart = (d: string) => {
    try { return new Date(d).toISOString().slice(0, 10) } catch { return '' }
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

  const filteredMovements = useMemo(() => {
    let result = movements.filter(m => {
      const s = searchTerm.toLowerCase()
      const matchSearch = !s || m.itemReference?.toLowerCase().includes(s) || m.itemNom?.toLowerCase().includes(s) || m.operateur?.toLowerCase().includes(s) || m.motif?.toLowerCase().includes(s)
      const matchType = typeFilter === 'ALL' || m.type === typeFilter
      const dp = getDatePart(m.date)
      const matchFrom = !dateFrom || dp >= dateFrom
      const matchTo = !dateTo || dp <= dateTo
      return matchSearch && matchType && matchFrom && matchTo
    })
    result.sort((a, b) => {
      if (sortField === 'date') return sortDir === 'asc' ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime()
      const va = a[sortField] ?? '', vb = b[sortField] ?? ''
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return result
  }, [movements, searchTerm, typeFilter, dateFrom, dateTo, sortField, sortDir])

  const totalPages = Math.ceil(filteredMovements.length / rowsPerPage) || 1
  const start = (currentPage - 1) * rowsPerPage
  const currentMovements = filteredMovements.slice(start, start + rowsPerPage)

  const stats = useMemo(() => ({
    total: movements.length,
    entrees: movements.filter(m => m.type === 'ENTREE').length,
    sorties: movements.filter(m => m.type === 'SORTIE').length,
    totalQteEntree: movements.filter(m => m.type === 'ENTREE').reduce((s, m) => s + Number(m.quantite || 0), 0),
    totalQteSortie: movements.filter(m => m.type === 'SORTIE').reduce((s, m) => s + Number(m.quantite || 0), 0),
  }), [movements])

  const activeFilters = [searchTerm, typeFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const exportExcel = () => {
    const rows = filteredMovements.map(m => ({
      'Horodatage': formatDateTime(m.date),
      'Référence Article': m.itemReference,
      'Désignation': m.itemNom,
      'Type': m.type,
      'Quantité': Number(m.quantite),
      'Opérateur': m.operateur || '—',
      'Motif': m.motif || '—',
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [18, 18, 38, 10, 12, 18, 25].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, 'Mouvements')
    XLSX.writeFile(wb, `mouvements_stock_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (loading && movements.length === 0) return <PageSkeleton type='table' />

  return (
    <div className='card card-flush'>

      {}
      <div className='card-header border-0 pt-6 pb-0'>
        <div className='d-flex gap-4 flex-wrap'>
          {[
            { label: 'Total mouvements', val: stats.total.toLocaleString(), color: 'primary', icon: 'arrows-loop' },
            { label: 'Entrées', val: stats.entrees.toLocaleString(), color: 'success', icon: 'arrow-down' },
            { label: 'Sorties', val: stats.sorties.toLocaleString(), color: 'danger', icon: 'arrow-up' },
            { label: 'Qté entrée totale', val: stats.totalQteEntree.toLocaleString(), color: 'info', icon: 'plus-circle' },
            { label: 'Qté sortie totale', val: stats.totalQteSortie.toLocaleString(), color: 'warning', icon: 'minus-circle' },
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

      {}
      <div className='card-header border-0 pt-4 pb-2'>
        <div className='card-title flex-wrap gap-2'>
          {}
          <div className='d-flex align-items-center position-relative my-1'>
            <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-4 text-gray-400' />
            <input
              type='text'
              className='form-control form-control-solid w-250px ps-14'
              placeholder='Référence, désignation, opérateur...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {}
          <div className='d-flex gap-2'>
            {[
              { val: 'ALL', label: 'Tous', color: 'primary' },
              { val: 'ENTREE', label: '↓ Entrées', color: 'success' },
              { val: 'SORTIE', label: '↑ Sorties', color: 'danger' },
            ].map(t => (
              <button
                key={t.val}
                type='button'
                className={`btn btn-sm ${typeFilter === t.val ? `btn-${t.color}` : `btn-light-${t.color}`}`}
                onClick={() => setTypeFilter(t.val)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className='card-toolbar gap-2 flex-wrap'>
          {}
          <div className='d-flex align-items-center gap-1 me-2'>
            <span className='text-muted fs-8 fw-semibold me-1'>Période :</span>
            {[1, 3, 6, 12].map(m => (
              <button
                key={m}
                type='button'
                className={`btn btn-sm ${months === m ? 'btn-primary' : 'btn-light'}`}
                style={{minWidth: 38}}
                onClick={() => setMonths(m)}
              >
                {m}M
              </button>
            ))}
          </div>

          <select
            className='form-select form-select-solid form-select-sm w-auto'
            value={rowsPerPage}
            onChange={e => setRowsPerPage(Number(e.target.value))}
          >
            {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n} lignes</option>)}
          </select>

          <button
            type='button'
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-light-primary'}`}
            onClick={() => setShowFilters(v => !v)}
          >
            <KTIcon iconName='calendar' className='fs-3 me-1' />
            Dates
            {(dateFrom || dateTo) && (
              <span className='badge badge-circle badge-danger ms-2' style={{ fontSize: 9, width: 16, height: 16 }}>!</span>
            )}
          </button>

          {activeFilters > 0 && (
            <button
              type='button'
              className='btn btn-sm btn-light-danger'
              onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setDateFrom(''); setDateTo('') }}
            >
              <KTIcon iconName='cross-circle' className='fs-3 me-1' />
              Réinitialiser
            </button>
          )}

          <button type='button' className='btn btn-sm btn-light-success' onClick={exportExcel}>
            <KTIcon iconName='exit-up' className='fs-3 me-1' />
            Excel ({filteredMovements.length})
          </button>
        </div>
      </div>

      {}
      {showFilters && (
        <div className='card-header border-0 pt-0 pb-3'>
          <div className='d-flex flex-wrap gap-4 align-items-end bg-light rounded p-4 w-100'>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Date de (du)</label>
              <input type='date' className='form-control form-control-solid form-control-sm' value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Date de (au)</label>
              <input type='date' className='form-control form-control-solid form-control-sm' value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className='ms-auto d-flex align-items-end'>
              <span className='text-muted fs-7'><strong className='text-primary'>{filteredMovements.length}</strong> mouvement(s)</span>
            </div>
          </div>
        </div>
      )}

      {}
      <div className='card-body pt-0'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed table-hover fs-7 gy-2'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('date')}>Date <SortIcon field='date' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('itemReference')}>Référence <SortIcon field='itemReference' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('type')}>Type <SortIcon field='type' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('motif')}>Nature <SortIcon field='motif' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('quantite')}>Quantité <SortIcon field='quantite' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('operateur')}>Site <SortIcon field='operateur' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('reference')}>Document <SortIcon field='reference' /></th>
                <th className='text-end pe-4'>Actions</th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-semibold'>
              {currentMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-center py-10'>
                    <KTIcon iconName='search-list' className='fs-2x text-gray-300 d-block mb-2' />
                    <span className='text-muted fs-6'>Aucun mouvement trouvé</span>
                  </td>
                </tr>
              ) : currentMovements.map((m, idx) => {
                const isEntree = m.type === 'ENTREE'
                return (
                  <tr key={`${m.id}-${idx}`}>
                    <td className='ps-4 text-muted'>{formatDateTime(m.date)}</td>
                    <td className='fw-bold text-gray-800'>{m.itemReference}</td>
                    <td>
                      <span className={`badge badge-light-${isEntree ? 'success' : 'danger'}`}>
                        {isEntree ? '↓ ENTRÉE' : '↑ SORTIE'}
                      </span>
                    </td>
                    <td className='text-muted fs-8' style={{maxWidth: 160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={m.motif}>{m.motif || '—'}</td>
                    <td>
                      <span className={`fw-bold text-${isEntree ? 'success' : 'danger'}`}>
                        {isEntree ? '+' : '-'}{Number(m.quantite).toLocaleString()}
                      </span>
                    </td>
                    <td className='text-muted'>{m.operateur || '—'}</td>
                    <td className='text-muted fs-8'>{m.reference || '—'}</td>
                    <td className='text-end pe-4'>
                      <button
                        type='button'
                        className='btn btn-icon btn-light btn-active-light-primary btn-sm'
                        title='Voir détails'
                        onClick={() => { setSelectedMovement(m); setShowModal(true) }}
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

        {}
        <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 pt-4 border-top'>
          <div className='text-muted fs-7'>
            Affichage de <strong className='text-gray-800'>{filteredMovements.length === 0 ? 0 : start + 1}</strong> à{' '}
            <strong className='text-gray-800'>{Math.min(start + rowsPerPage, filteredMovements.length)}</strong> sur{' '}
            <strong className='text-primary'>{filteredMovements.length}</strong> mouvements
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

      {}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className='fw-bold fs-5'>
            <span className={`badge badge-light-${selectedMovement?.type === 'ENTREE' ? 'success' : 'danger'} me-2`}>
              {selectedMovement?.type === 'ENTREE' ? '↓ ENTRÉE' : '↑ SORTIE'}
            </span>
            {selectedMovement?.itemReference}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMovement && (
            <div>
              {[
                { label: 'Désignation', val: selectedMovement.itemNom || '—' },
                { label: 'Date / Heure', val: formatDateTime(selectedMovement.date) },
                { label: 'Type mouvement', val: <span className={`badge badge-light-${selectedMovement.type === 'ENTREE' ? 'success' : 'danger'}`}>{selectedMovement.type === 'ENTREE' ? '↓ Entrée' : '↑ Sortie'}</span> },
                { label: 'Nature opération', val: selectedMovement.motif || '—' },
                { label: 'Quantité', val: <span className={`fw-bolder fs-4 text-${selectedMovement.type === 'ENTREE' ? 'success' : 'danger'}`}>{selectedMovement.type === 'ENTREE' ? '+' : '-'}{Number(selectedMovement.quantite).toLocaleString()}</span> },
                { label: 'Site / Source', val: selectedMovement.operateur || '—' },
                { label: 'N° Document', val: selectedMovement.reference || '—' },
              ].map(({ label, val }) => (
                <div key={label} className='d-flex align-items-center justify-content-between py-3 border-bottom'>
                  <span className='text-muted fw-semibold fs-7'>{label}</span>
                  <span className='fw-bold text-gray-800 fs-7'>{val}</span>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type='button' className='btn btn-sm btn-light' onClick={() => setShowModal(false)}>Fermer</button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}