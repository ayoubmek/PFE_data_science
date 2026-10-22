import { useEffect, useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'
import * as XLSX from 'xlsx'
import { apiErrorMessage } from '../../config'
import { fetchStockItems, fetchStockKpi, StockItem } from '../../services/api'
import { fmt } from '../../utils/format'

type SortField = keyof StockItem

const isLowStock = (item: StockItem) => item.statut === 'RUPTURE' || item.statut === 'CRITIQUE'

export default function StockPage() {
  const itemsQuery = useQuery('stockItems', fetchStockItems)
  const kpiQuery = useQuery('stockKpi', fetchStockKpi)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('designation')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const kpi = kpiQuery.data

  useEffect(() => { setCurrentPage(1) }, [searchTerm, sortField, sortDir, rowsPerPage])


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
      return matchSearch
    })
    result.sort((a, b) => {
      const va = a[sortField] ?? '', vb = b[sortField] ?? ''
      if (!isNaN(Number(va))) return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va)
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return result
  }, [items, searchTerm, sortField, sortDir])

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1
  const start = (currentPage - 1) * rowsPerPage
  const currentItems = filteredItems.slice(start, start + rowsPerPage)

  const stats = useMemo(() => ({
    total: new Set(items.map(i => i.reference)).size,
    nbCategories: new Set(items.map(i => i.categorie).filter(Boolean)).size,
  }), [items])


  const exportExcel = () => {
    const rows = filteredItems.map(i => ({
      'DateStock': i.dateStock,
      'No_': i.reference,
      'Description': i.designation,
      'Gen_ Prod_ Posting Group': i.genProdPostingGroup,
      'Quantité': Number(i.quantite),
      'Cout': Number(i.valeurTotale),
      'Site': i.emplacement,
      'Nom abrégé': i.nomAbrege,
      'GroupeItem': i.categorie,
      'GroupeClient': i.groupeClient,
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
              placeholder='No_, Description, Site, Nom abrégé, GroupeClient...'
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

          <button type='button' className='btn btn-sm btn-light-success' onClick={exportExcel}>
            <KTIcon iconName='exit-up' className='fs-3 me-1' />
            Excel ({filteredItems.length})
          </button>
        </div>
      </div>

      <div className='card-body pt-0'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed table-hover fs-8 gy-2'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='ps-4 cursor-pointer user-select-none' onClick={() => handleSort('dateStock')}>DateStock <SortIcon field='dateStock' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('reference')}>No_ <SortIcon field='reference' /></th>
                <th className='min-w-150px cursor-pointer user-select-none' onClick={() => handleSort('designation')}>Description <SortIcon field='designation' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('genProdPostingGroup')}>Gen_ Prod_ Posting Group <SortIcon field='genProdPostingGroup' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('quantite')}>Quantité <SortIcon field='quantite' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('valeurTotale')}>Cout <SortIcon field='valeurTotale' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('emplacement')}>Site <SortIcon field='emplacement' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('nomAbrege')}>Nom abrégé <SortIcon field='nomAbrege' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('categorie')}>GroupeItem <SortIcon field='categorie' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('groupeClient')}>GroupeClient <SortIcon field='groupeClient' /></th>
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-semibold'>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className='text-center py-10'>
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
                    <td className='text-muted'>{i.emplacement}</td>
                    <td className='text-muted'>{i.nomAbrege}</td>
                    <td><span className='badge badge-light-info'>{i.categorie}</span></td>
                    <td className='text-muted'>{i.groupeClient || '—'}</td>
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
    </div>
  )
}
