import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Modal } from 'react-bootstrap'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'
import * as XLSX from 'xlsx'

export default function StockPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [siteFilter, setSiteFilter] = useState('ALL')
  const [alertFilter, setAlertFilter] = useState('ALL')
  const [sortField, setSortField] = useState('designation')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [showFilters, setShowFilters] = useState(false)

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${apiUrl}/stock/items`)
      setItems(data || [])
    } catch {
      setItems([
        { id: '1', reference: 'A0362AC', designation: 'FLOTTEUR J81 ASSY', categorie: 'PF-PSF', quantite: 10000, valeurUnitaire: 617.90, dateStock: '2026-03-31', emplacement: 'Kondar Site A', encours: 0, genProdPostingGroup: '09-PF-TN1', nomAbrege: 'MOLDFR3', groupeClient: 'M+H', valeurTotale: 6179000, seuilAlerte: 20 },
        { id: '2', reference: 'A0391B', designation: 'FLOTTEUR F199/X4400', categorie: 'PF-PSF', quantite: 5, valeurUnitaire: 94.59, dateStock: '2026-03-31', emplacement: 'Kondar Site A', encours: 0, genProdPostingGroup: '03-SEM-TN1', nomAbrege: '0', groupeClient: '0', valeurTotale: 472.95, seuilAlerte: 20 },
        { id: '3', reference: 'B0112XX', designation: 'BOITIER INJECTION T4', categorie: 'COMPOSANTS', quantite: 4500, valeurUnitaire: 145.00, dateStock: '2026-03-31', emplacement: 'Magasin Central', encours: 150, genProdPostingGroup: '01-MP-TN1', nomAbrege: 'INJ01', groupeClient: 'VALEO', valeurTotale: 652500, seuilAlerte: 50 },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, categoryFilter, siteFilter, alertFilter, sortField, sortDir, rowsPerPage])

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(items.map(i => i.categorie).filter(Boolean)))], [items])
  const sites = useMemo(() => ['ALL', ...Array.from(new Set(items.map(i => i.emplacement).filter(Boolean)))], [items])

  const isLowStock = (item: any) => Number(item.quantite) <= Number(item.seuilAlerte ?? 20)

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: string }) => (
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
      const matchAlert = alertFilter === 'ALL' || (alertFilter === 'LOW' && isLowStock(i)) || (alertFilter === 'OK' && !isLowStock(i))
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
    total: items.length,
    lowStock: items.filter(i => isLowStock(i)).length,
    totalValue: items.reduce((s, i) => s + (Number(i.valeurTotale) || Number(i.quantite) * Number(i.valeurUnitaire) || 0), 0),
    nbCategories: new Set(items.map(i => i.categorie).filter(Boolean)).size,
  }), [items])

  const activeFilters = [searchTerm, categoryFilter !== 'ALL', siteFilter !== 'ALL', alertFilter !== 'ALL'].filter(Boolean).length

  const exportExcel = () => {
    const rows = filteredItems.map(i => ({
      'Date Stock': i.dateStock,
      'Référence': i.reference,
      'Désignation': i.designation,
      'Catégorie': i.categorie,
      'Quantité': Number(i.quantite),
      'Coût Unitaire (DT)': Number(i.valeurUnitaire),
      'Valeur Globale (DT)': Number(i.valeurTotale) || Number(i.quantite) * Number(i.valeurUnitaire),
      'Site': i.emplacement,
      'Nom Abrégé': i.nomAbrege,
      'Groupe Client': i.groupeClient,
      'Groupe Prod': i.genProdPostingGroup,
      'Alerte': isLowStock(i) ? 'Stock Bas' : 'Normal',
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [14, 14, 40, 18, 12, 18, 20, 20, 14, 16, 18, 10].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, 'Stock')
    XLSX.writeFile(wb, `stock_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (loading && items.length === 0) return <PageSkeleton type='table' />

  return (
    <div className='card card-flush'>

      {}
      <div className='card-header border-0 pt-6 pb-0'>
        <div className='d-flex gap-4 flex-wrap'>
          {[
            { label: 'Total Articles', val: stats.total.toLocaleString(), color: 'primary', icon: 'element-11' },
            { label: 'Stock Bas', val: stats.lowStock.toLocaleString(), color: 'danger', icon: 'warning-2' },
            { label: 'Catégories', val: stats.nbCategories.toString(), color: 'info', icon: 'category' },
            { label: 'Valeur Totale', val: `${(stats.totalValue / 1e6).toFixed(2)}M DT`, color: 'success', icon: 'dollar' },
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
        <div className='card-title'>
          <div className='d-flex align-items-center position-relative my-1'>
            <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-4 text-gray-400' />
            <input
              type='text'
              className='form-control form-control-solid w-250px ps-14'
              placeholder='Réf, désignation, site, client...'
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

          <button type='button' className='btn btn-sm btn-light-primary' onClick={fetchItems} disabled={loading}>
            {loading
              ? <span className='spinner-border spinner-border-sm me-2' />
              : <KTIcon iconName='arrows-loop' className='fs-3 me-1' />
            }
            Actualiser
          </button>
        </div>
      </div>

      {}
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
              <label className='form-label fs-7 fw-bold text-gray-600'>Niveau alerte</label>
              <select className='form-select form-select-solid form-select-sm' style={{ width: 160 }} value={alertFilter} onChange={e => setAlertFilter(e.target.value)}>
                <option value='ALL'>Tous les niveaux</option>
                <option value='LOW'>⚠️ Stock bas uniquement</option>
                <option value='OK'>✅ Stock normal</option>
              </select>
            </div>
            <div className='ms-auto d-flex align-items-end'>
              <span className='text-muted fs-7'><strong className='text-primary'>{filteredItems.length}</strong> article(s)</span>
            </div>
          </div>
        </div>
      )}

      {}
      <div className='card-body pt-0'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed table-hover fs-8 gy-2'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='ps-4 cursor-pointer user-select-none' onClick={() => handleSort('dateStock')}>Date <SortIcon field='dateStock' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('reference')}>Référence <SortIcon field='reference' /></th>
                <th className='cursor-pointer user-select-none min-w-150px' onClick={() => handleSort('designation')}>Désignation <SortIcon field='designation' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('genProdPostingGroup')}>Groupe Prod <SortIcon field='genProdPostingGroup' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('quantite')}>Quantité <SortIcon field='quantite' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('valeurUnitaire')}>Coût Unit. <SortIcon field='valeurUnitaire' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('valeurTotale')}>Valeur Totale <SortIcon field='valeurTotale' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('emplacement')}>Site <SortIcon field='emplacement' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('nomAbrege')}>Abrégé <SortIcon field='nomAbrege' /></th>
                <th className='cursor-pointer user-select-none' onClick={() => handleSort('categorie')}>Catégorie <SortIcon field='categorie' /></th>
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
                const val = Number(i.valeurTotale) || Number(i.quantite) * Number(i.valeurUnitaire)
                return (
                  <tr key={`${i.reference}-${i.dateStock}-${i.emplacement}-${idx}`}>
                    <td className='ps-4 text-muted'>{i.dateStock ? String(i.dateStock).slice(0, 10) : '—'}</td>
                    <td className='fw-bold text-gray-800'>{i.reference}</td>
                    <td className='text-gray-700 mw-150px text-truncate'>{i.designation}</td>
                    <td className='text-muted'>{i.genProdPostingGroup || '—'}</td>
                    <td>
                      <span className={`fw-bold text-${low ? 'danger' : 'success'}`}>
                        {Number(i.quantite).toLocaleString()}
                      </span>
                      {low && <span className='badge badge-light-danger ms-2 fs-9'>BAS</span>}
                    </td>
                    <td className='text-gray-600'>{Number(i.valeurUnitaire).toFixed(2)} DT</td>
                    <td className='fw-bold text-gray-700'>{val.toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT</td>
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

        {}
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

      {}
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
                { label: 'Référence', val: selectedItem.reference },
                { label: 'Date Stock', val: selectedItem.dateStock ? String(selectedItem.dateStock).slice(0, 10) : '—' },
                { label: 'Catégorie', val: <span className='badge badge-light-info'>{selectedItem.categorie || '—'}</span> },
                { label: 'Site', val: selectedItem.emplacement || '—' },
                { label: 'Quantité', val: <span className={`fw-bolder text-${isLowStock(selectedItem) ? 'danger' : 'success'}`}>{Number(selectedItem.quantite).toLocaleString()}</span> },
                { label: 'Coût Unitaire', val: `${Number(selectedItem.valeurUnitaire).toFixed(3)} DT` },
                { label: 'Valeur Globale', val: `${(Number(selectedItem.valeurTotale) || Number(selectedItem.quantite) * Number(selectedItem.valeurUnitaire)).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} DT` },
                { label: 'Groupe Prod', val: selectedItem.genProdPostingGroup || '—' },
                { label: 'Nom Abrégé', val: selectedItem.nomAbrege || '—' },
                { label: 'Groupe Client', val: selectedItem.groupeClient || '—' },
                { label: 'Encours', val: selectedItem.encours ?? '—' },
                { label: 'Niveau Stock', val: isLowStock(selectedItem) ? <span className='badge badge-light-danger'>⚠ Stock Bas</span> : <span className='badge badge-light-success'>✓ Normal</span> },
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