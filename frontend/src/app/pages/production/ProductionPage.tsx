import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'
import * as XLSX from 'xlsx'

let globalCachedOrders: any[] = []

export default function ProductionPage() {
  const [orders, setOrders] = useState<any[]>(globalCachedOrders)
  const [loading, setLoading] = useState(globalCachedOrders.length === 0)
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
    if (globalCachedOrders.length === 0) setLoading(true)
    try {
      const { data } = await axios.get(`${apiUrl}/production/orders`)
      const mapped = (Array.isArray(data) ? data : []).map((o: any) => ({
        id: o.id,
        code: o.reference || o.code,
        itemNo: o.itemNo || '-',
        articleNom: o.article || o.articleNom,
        quantiteProduite: Number(o.quantiteRealisee) || 0,
        scrapQuantity: Number(o.scrapQuantity) || 0,
        runTime: Number(o.runTime) || 0,
        dateDebut: o.dateDebut || '2026-01-01',
        machineNom: o.machineNom || 'Atelier',
        machineCode: o.machineCode || '',
        machineLabel: o.notes || '',
        responsable: o.responsable || 'Tunisie',
      }))
      globalCachedOrders = mapped
      setOrders(mapped)
    } catch (err) {
      console.error('Failed to fetch production orders from API:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, statusFilter, dateFrom, dateTo, sortField, sortDir, rowsPerPage])

  const workshops = useMemo(() => ['ALL', ...Array.from(new Set(orders.map(o => o.machineNom).filter(Boolean)))], [orders])

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
      const matchSearch = !s || o.code?.toLowerCase().includes(s) || o.itemNo?.toLowerCase().includes(s) || o.articleNom?.toLowerCase().includes(s) || o.responsable?.toLowerCase().includes(s) || o.machineCode?.toLowerCase().includes(s)
      const matchWorkshop = statusFilter === 'ALL' || o.machineNom === statusFilter
      const matchFrom = !dateFrom || (o.dateDebut && o.dateDebut >= dateFrom)
      const matchTo = !dateTo || (o.dateDebut && o.dateDebut <= dateTo)
      return matchSearch && matchWorkshop && matchFrom && matchTo
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

  const stats = useMemo(() => {
    const total = orders.length
    const totalOutput = orders.reduce((s, o) => s + (Number(o.quantiteProduite) || 0), 0)
    const totalScrap = orders.reduce((s, o) => s + (Number(o.scrapQuantity) || 0), 0)
    const totalRunTime = Math.round(orders.reduce((s, o) => s + (Number(o.runTime) || 0), 0) * 10) / 10
    const scrapRate = totalOutput + totalScrap > 0 ? ((totalScrap / (totalOutput + totalScrap)) * 100).toFixed(2) : '0.00'
    return {
      total,
      totalOutput,
      totalScrap,
      totalRunTime,
      scrapRate,
    }
  }, [orders])

  const activeFilters = [searchTerm, statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const exportExcel = () => {
    const rows = filteredOrders.map(o => ({
      'Document No_': o.code,
      'Item No_': o.itemNo,
      'Description': o.articleNom,
      'Output Quantity': o.quantiteProduite,
      'Scrap Quantity': o.scrapQuantity,
      'Run Time (h)': o.runTime,
      'Work Center No_': o.machineNom || '',
      'Machine': o.machineCode ? `${o.machineCode} (${o.machineLabel || o.articleNom})` : '',
      'Posting Date': o.dateDebut,
      'Data Base': o.responsable || '',
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [18, 16, 32, 16, 14, 12, 16, 25, 14, 14].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, 'Production')
    XLSX.writeFile(wb, `production_FACT_CLE_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (loading && orders.length === 0) return <PageSkeleton type='table' />

  return (
    <div className='card card-flush'>

      <div className='card-header border-0 pt-6 pb-2'>
        <div className='d-flex gap-4 flex-wrap'>
          {[
            { label: 'Total Document No_', val: stats.total.toLocaleString(), color: 'primary', icon: 'element-11', sub: 'Ordres exécutés' },
            { label: 'Total Output Quantity', val: `${stats.totalOutput.toLocaleString()} u`, color: 'success', icon: 'check-circle', sub: 'Pièces conformes' },
            { label: 'Total Scrap Quantity', val: `${stats.totalScrap.toLocaleString()} u`, color: 'danger', icon: 'cross-circle', sub: `Taux : ${stats.scrapRate}%` },
            { label: 'Total Run Time', val: `${stats.totalRunTime.toLocaleString()} h`, color: 'info', icon: 'time', sub: 'Heures machine' },
          ].map(s => (
            <div key={s.label} className='d-flex align-items-center gap-2 bg-light-subtle rounded px-4 py-2'>
              <span className={`badge badge-circle badge-light-${s.color} p-4`}>
                <KTIcon iconName={s.icon} className={`fs-3 text-${s.color}`} />
              </span>
              <div>
                <div className={`fw-bolder fs-4 text-${s.color}`}>{s.val}</div>
                <div className='text-muted fs-8 fw-semibold'>{s.label} <span className='badge badge-light fs-9 ms-1'>{s.sub}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='card-header border-0 pt-4 pb-2'>
        <div className='card-title'>
          <div className='d-flex align-items-center position-relative my-1'>
            <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-4 text-gray-400' />
            <input
              type='text'
              className='form-control form-control-solid w-250px ps-14'
              placeholder='Document No_, Description, Atelier...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className='card-toolbar gap-2 flex-wrap'>
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
              className='btn btn-sm btn-light'
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('ALL')
                setDateFrom('')
                setDateTo('')
              }}
            >
              <KTIcon iconName='cross-circle' className='fs-3 me-1' />
              Réinitialiser
            </button>
          )}

          <button type='button' className='btn btn-sm btn-light-success' onClick={exportExcel}>
            <KTIcon iconName='exit-up' className='fs-3 me-1' />
            Excel ({filteredOrders.length})
          </button>
        </div>
      </div>

      {showFilters && (
        <div className='card-header border-0 pt-0 pb-3'>
          <div className='d-flex flex-wrap gap-4 align-items-end bg-light rounded p-4 w-100'>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Work Center No_</label>
              <select
                className='form-select form-select-solid form-select-sm'
                style={{ width: 180 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                {workshops.map(w => (
                  <option key={w} value={w}>{w === 'ALL' ? 'Tous les Ateliers' : w}</option>
                ))}
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

      <div className='card-body pt-0'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed table-hover fs-7 gy-2'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='ps-4 cursor-pointer user-select-none' onClick={() => handleSort('code')}>
                  Document No_ <SortIcon field='code' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('itemNo')}>
                  Item No_ <SortIcon field='itemNo' />
                </th>
                <th className='cursor-pointer user-select-none min-w-150px' onClick={() => handleSort('articleNom')}>
                  Description <SortIcon field='articleNom' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('quantiteProduite')}>
                  Output Quantity <SortIcon field='quantiteProduite' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('scrapQuantity')}>
                  Scrap Quantity <SortIcon field='scrapQuantity' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('runTime')}>
                  Run Time <SortIcon field='runTime' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('machineNom')}>
                  Work Center No_ <SortIcon field='machineNom' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('dateDebut')}>
                  Posting Date <SortIcon field='dateDebut' />
                </th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('responsable')}>
                  Data Base <SortIcon field='responsable' />
                </th>
                <th className='text-end pe-4'>Actions</th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-semibold'>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className='text-center py-10'>
                    <KTIcon iconName='search-list' className='fs-2x text-gray-300 d-block mb-2' />
                    <span className='text-muted fs-6'>Aucun ordre de fabrication trouvé</span>
                  </td>
                </tr>
              ) : currentOrders.map(o => {
                return (
                  <tr key={o.id}>
                    <td className='ps-4 fw-bold text-gray-800'>{o.code}</td>
                    <td>
                      <span className='badge badge-light-primary fw-bold fs-8'>{o.itemNo}</span>
                    </td>
                    <td className='text-gray-700'>{o.articleNom}</td>
                    <td className='text-gray-900 fw-bold'>{(o.quantiteProduite || 0).toLocaleString()} u</td>
                    <td>
                      <span className={o.scrapQuantity > 0 ? 'badge badge-light-danger fw-bold' : 'text-muted'}>
                        {o.scrapQuantity > 0 ? `${o.scrapQuantity.toLocaleString()} u` : '0 u'}
                      </span>
                    </td>
                    <td className='text-gray-700 fw-semibold'>
                      {o.runTime > 0 ? `${o.runTime} h` : '0 h'}
                    </td>
                    <td>
                      <span className='badge badge-light-info fw-bold'>{o.machineNom || 'Atelier'}</span>
                    </td>
                    <td className='text-muted'>{o.dateDebut}</td>
                    <td>
                      <span className='badge badge-light-dark'>{o.responsable || 'Tunisie'}</span>
                    </td>
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

        {}
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

      {}
      <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title className='fw-bold fs-5'>
            Détails — <span className='text-primary'>{selectedOrder?.code}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div className='row g-4'>
              {[
                { label: 'Document No_', val: selectedOrder.code },
                { label: 'Item No_', val: <span className='badge badge-light-primary fw-bold fs-7'>{selectedOrder.itemNo}</span> },
                { label: 'Description', val: selectedOrder.articleNom },
                { label: 'Output Quantity', val: <span className='fw-bolder text-success fs-6'>{selectedOrder.quantiteProduite?.toLocaleString()} unités</span> },
                { label: 'Scrap Quantity', val: <span className={`fw-bold ${selectedOrder.scrapQuantity > 0 ? 'text-danger' : 'text-muted'}`}>{selectedOrder.scrapQuantity?.toLocaleString()} unités</span> },
                { label: 'Run Time', val: <span className='fw-semibold text-gray-800'>{selectedOrder.runTime > 0 ? `${selectedOrder.runTime} heures` : '0 heure'}</span> },
                { label: 'Work Center No_', val: <span className='badge badge-light-info fw-bold'>{selectedOrder.machineNom || '—'}</span> },
                { label: 'Machine (No_)', val: selectedOrder.machineCode ? `${selectedOrder.machineCode} ${selectedOrder.machineLabel ? `(${selectedOrder.machineLabel})` : ''}` : '—' },
                { label: 'Posting Date', val: selectedOrder.dateDebut || '—' },
                { label: 'Data Base', val: <span className='badge badge-light-dark'>{selectedOrder.responsable || 'Tunisie'}</span> },
              ].map(({ label, val }) => (
                <div className='col-md-6' key={label}>
                  <div className='fs-8 text-muted fw-semibold mb-1'>{label}</div>
                  <div className='fs-7 fw-bold text-gray-800'>{val}</div>
                  <div className='separator separator-dashed mt-3' />
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