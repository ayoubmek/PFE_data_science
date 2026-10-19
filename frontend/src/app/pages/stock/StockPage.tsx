import { useEffect, useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'
import * as XLSX from 'xlsx'
import { apiErrorMessage } from '../../config'
import { fetchStockItems, fetchStockKpi, StockItem, StockStatus } from '../../services/api'
import { fmt } from '../../utils/format'

type SortField = keyof StockItem

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string }> = {
  RUPTURE: { label: 'Rupture', color: 'danger' },
  CRITIQUE: { label: 'Critique', color: 'warning' },
  NORMAL: { label: 'Normal', color: 'success' },
  SURSTOCK: { label: 'Surstock', color: 'info' },
  INACTIF: { label: 'Inactif', color: 'secondary' },
  SANS_CONSOMMATION: { label: 'Sans consommation', color: 'dark' },
}
const statusOf = (code: StockStatus | null) => (code ? STATUS_CONFIG[code] : { label: '—', color: 'secondary' })
const isLowStock = (item: StockItem) => item.statut === 'RUPTURE' || item.statut === 'CRITIQUE'

export default function StockPage() {
  const itemsQuery = useQuery('stockItems', fetchStockItems)
  const kpiQuery = useQuery('stockKpi', fetchStockKpi)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [siteFilter, setSiteFilter] = useState('ALL')
  const [alertFilter, setAlertFilter] = useState('ALL')
  const [sortField, setSortField] = useState<SortField>('designation')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [showFilters, setShowFilters] = useState(false)
  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const kpi = kpiQuery.data

  useEffect(() => { setCurrentPage(1) }, [searchTerm, categoryFilter, siteFilter, alertFilter, sortField, sortDir, rowsPerPage])

  const categories = useMemo(() => ['ALL', ...uniqueValues(items.map(i => i.categorie))], [items])
  const sites = useMemo(() => ['ALL', ...uniqueValues(items.map(i => i.emplacement))], [items])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className='ms-1 text-gray-400' style={{ fontSize: 9 }}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  )

  const filteredItems = useMemo(() => {
    let result = items.filter(i => {
      const s = searchTerm.toLowerCase()
      const matchSearch = !s || i.designation?.toLowerCase().includes(s) || i.reference?.toLowerCase().includes(s) || i.emplacement?.toLowerCase().includes(s) || i.nomAbrege?.toLowerCase().includes(s) || i.groupeClient?.toLowerCase().includes(s)
      const matchCat = categoryFilter === 'ALL' || i.categorie === categoryFilter
      const matchSite = siteFilter === 'ALL' || i.emplacement === siteFilter
      const matchAlert = alertFilter === 'ALL' || i.statut === alertFilter
      return matchSearch && matchCat && matchSite && matchAlert
    })
    result.sort((a, b) => {
      const va = a[sortField] ?? '', vb = b[sortField] ?? ''
      if (!isNaN(Number(va))) return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va)
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return result
  }, [items, searchTerm, categoryFilter, siteFilter, alertFilter, sortField, sortDir])

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1
  const start = (currentPage - 1) * rowsPerPage
  const currentItems = filteredItems.slice(start, start + rowsPerPage)

  const stats = useMemo(() => ({
    total: new Set(items.map(i => i.reference)).size,
    nbCategories: new Set(items.map(i => i.categorie).filter(Boolean)).size,
  }), [items])

  const activeFilters = [searchTerm, categoryFilter !== 'ALL', siteFilter !== 'ALL', alertFilter !== 'ALL'].filter(Boolean).length

  const exportExcel = () => {
    const rows = filteredItems.map(i => ({
      'datestock': i.dateStock,
      'No_': i.reference,
      'Description': i.designation,
      'groupeitem': i.categorie,
      'Quantité': Number(i.quantite),
      'Coût unitaire (TND)': i.valeurUnitaire,
      'Valeur (Cout, TND)': Number(i.valeurTotale),
      'Statut': statusOf(i.statut).label,
      'Couverture (jours)': i.couvertureJours,
      'Consommation / jour': i.consommationJournaliere,
      'Site': i.emplacement,
      'Nom abrégé': i.nomAbrege,
      'groupeclient': i.groupeClient,
      'Gen_ Prod_ Posting Group': i.genProdPostingGroup,
      'Encours': i.encours ?? 0,
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [14, 14, 40, 18, 12, 18, 20, 20, 14, 16, 18, 10].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, 'Stock')
    XLSX.writeFile(wb, `stock_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (itemsQuery.isLoading) return <PageSkeleton type='table' />
  if (itemsQuery.error && items.length === 0) {
    return <div className='alert alert-danger p-5'>{apiErrorMessage(itemsQuery.error, 'Impossible de charger le stock depuis le Data Warehouse.')}</div>
  }

  const statuts = kpi?.statuts ?? {}
  const plan = kpi?.reapprovisionnement

  return (
    <div className='card card-flush'>

      <div className='card-header border-0 pt-6 pb-0'>
        <div className='d-flex gap-4 flex-wrap'>
          {[
            { label: `Articles en stock au ${kpi?.dateStock ?? '—'}`, val: fmt(stats.total), color: 'primary', icon: 'element-11' },
            { label: 'Ruptures (articles consommés)', val: fmt(statuts.RUPTURE), color: 'danger', icon: 'cross-circle' },
            { label: 'Valeur totale du stock', val: `${fmt((kpi?.valeurTotaleStock ?? 0) / 1e6, 2)} M TND`, color: 'success', icon: 'dollar' },
            {
              label: `Plan ${plan?.horizonJours ?? '—'} j : ${fmt(plan?.nbReferences)} réf. · ${fmt(plan?.quantiteTotale)} unités`,
              val: `${fmt((plan?.budgetTnd ?? 0) / 1e6, 2)} M TND`,
              color: 'dark',
              icon: 'basket',
            },
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

      <div className='card-header border-0 pt-4 pb-2'>
        <div className='card-title'>
          <div className='d-flex align-items-center position-relative my-1'>
            <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-4 text-gray-400' />
            <input
              type='text'
              className='form-control form-control-solid w-250px ps-14'
              placeholder='No_, Description, Site, groupeitem...'
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
              className='btn btn-sm btn-light-danger'
              onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); setSiteFilter('ALL'); setAlertFilter('ALL') }}
            >
              <KTIcon iconName='cross-circle' className='fs-3 me-1' />
              Réinitialiser
            </button>
          )}

          <button type='button' className='btn btn-sm btn-light-success' onClick={exportExcel}>
            <KTIcon iconName='exit-up' className='fs-3 me-1' />
            Excel ({filteredItems.length})
          </button>
        </div>
      </div>

      {showFilters && (
        <div className='card-header border-0 pt-0 pb-3'>
          <div className='d-flex flex-wrap gap-4 align-items-end bg-light rounded p-4 w-100'>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Catégorie</label>
              <select className='form-select form-select-solid form-select-sm' style={{ width: 180 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'Toutes les catégories' : c}</option>)}
              </select>
            </div>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Site / Emplacement</label>
              <select className='form-select form-select-solid form-select-sm' style={{ width: 200 }} value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
                {sites.map(s => <option key={s} value={s}>{s === 'ALL' ? 'Tous les sites' : s}</option>)}
              </select>
            </div>
            <div>
              <label className='form-label fs-7 fw-bold text-gray-600'>Statut de couverture</label>
              <select className='form-select form-select-solid form-select-sm' style={{ width: 200 }} value={alertFilter} onChange={e => setAlertFilter(e.target.value)}>
                <option value='ALL'>Tous les statuts</option>
                {Object.entries(STATUS_CONFIG).map(([code, cfg]) => (
                  <option key={code} value={code}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className='ms-auto d-flex align-items-end'>
              <span className='text-muted fs-7'><strong className='text-primary'>{filteredItems.length}</strong> article(s)</span>
            </div>
          </div>
        </div>
      )}

      <div className='card-body pt-0'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed table-hover fs-8 gy-2'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='ps-4 cursor-pointer user-select-none' onClick={() => handleSort('dateStock')}>datestock <SortIcon field='dateStock' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('reference')}>No_ <SortIcon field='reference' /></th>
                <th className='cursor-pointer user-select-none min-w-150px' onClick={() => handleSort('designation')}>Description <SortIcon field='designation' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('genProdPostingGroup')}>Gen_ Prod_ Posting Group <SortIcon field='genProdPostingGroup' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('quantite')}>Quantité <SortIcon field='quantite' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('valeurTotale')}>Valeur (Cout) <SortIcon field='valeurTotale' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('couvertureJours')}>Couverture <SortIcon field='couvertureJours' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('emplacement')}>Site <SortIcon field='emplacement' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('nomAbrege')}>Nom abrégé <SortIcon field='nomAbrege' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('categorie')}>groupeitem <SortIcon field='categorie' /></th>
                <th className='text-end pe-4'>Actions</th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-semibold'>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className='text-center py-10'>
                    <KTIcon iconName='search-list' className='fs-2x text-gray-300 d-block mb-2' />
                    <span className='text-muted fs-6'>Aucun article trouvé</span>
                  </td>
                </tr>
              ) : currentItems.map((i, idx) => {
                const low = isLowStock(i)
                return (
                  <tr key={`${i.reference}-${i.dateStock}-${i.emplacement}-${idx}`}>
                    <td className='ps-4 text-muted'>{i.dateStock ? String(i.dateStock).slice(0, 10) : '—'}</td>
                    <td className='fw-bold text-gray-800'>{i.reference}</td>
                    <td className='text-gray-700 mw-150px text-truncate'>{i.designation}</td>
                    <td className='text-muted'>{i.genProdPostingGroup || '—'}</td>
                    <td>
                      <span className={`fw-bold text-${low ? 'danger' : 'success'}`}>
                        {fmt(i.quantite)}
                      </span>
                    </td>
                    <td className='fw-bold text-gray-700'>{fmt(i.valeurTotale, 2)} TND</td>
                    <td className='text-gray-600'>{i.couvertureJours !== null && i.couvertureJours !== undefined ? `${fmt(i.couvertureJours, 1)} j` : '—'}</td>
                    <td className='text-muted'>{i.emplacement}</td>
                    <td className='text-muted'>{i.nomAbrege}</td>
                    <td><span className='badge badge-light-info'>{i.categorie}</span></td>
                    <td className='text-end pe-4'>
                      <button
                        type='button'
                        className='btn btn-icon btn-light btn-active-light-primary btn-sm'
                        title='Voir détails'
                        onClick={() => { setSelectedItem(i); setShowModal(true) }}
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

        <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 pt-4 border-top'>
          <div className='text-muted fs-7'>
            Affichage de <strong className='text-gray-800'>{filteredItems.length === 0 ? 0 : start + 1}</strong> à{' '}
            <strong className='text-gray-800'>{Math.min(start + rowsPerPage, filteredItems.length)}</strong> sur{' '}
            <strong className='text-primary'>{filteredItems.length}</strong> articles
          </div>
          <ul className='pagination pagination-outline'>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className='page-link' onClick={() => setCurrentPage(1)}>«</button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className='page-link' onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>‹</button>
            </li>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx2) => {
              const p = currentPage <= 3 ? idx2 + 1 : currentPage + idx2 - 2
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title className='fw-bold fs-5'>
            <span className='text-primary'>{selectedItem?.reference}</span>
            {' — '}{selectedItem?.designation}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className='row g-4'>
              {[
                { label: 'No_', val: selectedItem.reference },
                { label: 'datestock', val: selectedItem.dateStock ? String(selectedItem.dateStock).slice(0, 10) : '—' },
                { label: 'groupeitem', val: <span className='badge badge-light-info'>{selectedItem.categorie || '—'}</span> },
                { label: 'Site', val: selectedItem.emplacement || '—' },
                { label: 'Quantité', val: <span className={`fw-bolder text-${isLowStock(selectedItem) ? 'danger' : 'success'}`}>{fmt(selectedItem.quantite)}</span> },
                { label: 'Valeur de la ligne (Cout)', val: `${fmt(selectedItem.valeurTotale, 2)} TND` },
                { label: 'Coût unitaire déduit', val: selectedItem.valeurUnitaire !== null ? `${fmt(selectedItem.valeurUnitaire, 4)} TND` : '—' },
                { label: 'Consommation / jour (article)', val: fmt(selectedItem.consommationJournaliere, 1) },
                { label: 'Couverture (article, tous sites)', val: selectedItem.couvertureJours !== null && selectedItem.couvertureJours !== undefined ? `${fmt(selectedItem.couvertureJours, 1)} jours` : '—' },
                { label: 'Gen_ Prod_ Posting Group', val: selectedItem.genProdPostingGroup || '—' },
                { label: 'Nom abrégé', val: selectedItem.nomAbrege || '—' },
                { label: 'groupeclient', val: selectedItem.groupeClient || '—' },
                { label: 'Encours', val: selectedItem.encours ?? '—' },
                { label: 'Statut de couverture', val: <span className={`badge badge-light-${statusOf(selectedItem.statut).color}`}>{statusOf(selectedItem.statut).label}</span> },
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

function uniqueValues(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))))
}
