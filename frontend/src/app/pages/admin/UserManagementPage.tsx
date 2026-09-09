import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { KTIcon } from '../../../_metronic/helpers'

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATEUR'

export interface UserItem {
  id: number
  username: string
  fullName: string
  email: string
  role: UserRole
  enabled: boolean
  createdAt: string
  lastLogin?: string
}

const STORAGE_KEY = 'nexora_users_db'

const DEFAULT_USERS: UserItem[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Imen Ben Salem',
    email: 'imen.admin@nexora-industrial.com',
    role: 'ADMIN',
    enabled: true,
    createdAt: '2026-01-15',
    lastLogin: 'En ligne maintenant',
  },
  {
    id: 2,
    username: 'ayoub.mgr',
    fullName: 'Ayoub Hammami',
    email: 'ayoub.hammami@nexora-industrial.com',
    role: 'MANAGER',
    enabled: true,
    createdAt: '2026-02-01',
    lastLogin: "Aujourd'hui, 08:30",
  },
  {
    id: 3,
    username: 'rihab.stock',
    fullName: 'Rihab Idoudi',
    email: 'rihab.idoudi@nexora-industrial.com',
    role: 'MANAGER',
    enabled: true,
    createdAt: '2026-02-10',
    lastLogin: 'Hier, 17:45',
  },
  {
    id: 4,
    username: 'salah.op1',
    fullName: 'Salah Mejri',
    email: 'salah.mejri@atelier-kondar.tn',
    role: 'OPERATEUR',
    enabled: true,
    createdAt: '2026-02-20',
    lastLogin: 'Il y a 2 heures',
  },
  {
    id: 5,
    username: 'fatma.op2',
    fullName: 'Fatma Dridi',
    email: 'fatma.dridi@atelier-kondar.tn',
    role: 'OPERATEUR',
    enabled: true,
    createdAt: '2026-03-05',
    lastLogin: 'Hier, 14:10',
  },
  {
    id: 6,
    username: 'kamel.tech',
    fullName: 'Kamel Mansour',
    email: 'kamel.mansour@atelier-brno.cz',
    role: 'OPERATEUR',
    enabled: false,
    createdAt: '2026-03-12',
    lastLogin: 'Compte suspendu',
  },
]

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  ADMIN: {
    label: 'Administrateur',
    color: '#8950FC',
    bg: '#EEE5FF',
    icon: 'shield-tick',
    desc: 'Accès total système, gestion des utilisateurs, permissions et logs de sécurité.',
  },
  MANAGER: {
    label: 'Manager',
    color: '#009EF7',
    bg: '#E1F0FF',
    icon: 'element-11',
    desc: 'Supervision TRG, planification production, inventaire, IA Prophet et exports.',
  },
  OPERATEUR: {
    label: 'Opérateur',
    color: '#50CD89',
    bg: '#E8FFF3',
    icon: 'gear',
    desc: "Exécution des ordres d'atelier, saisie entrées/sorties et déclarations d'arrêts.",
  },
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'OPERATEUR' as UserRole,
    enabled: true,
  })

  // Load users from backend or localStorage
  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const { data } = await axios.get(`${apiUrl}/users`, { timeout: 2500 })
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } else {
        fallbackToStorage()
      }
    } catch (err) {
      fallbackToStorage()
    } finally {
      setLoading(false)
    }
  }

  const fallbackToStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setUsers(JSON.parse(saved))
        return
      } catch (e) {}
    }
    setUsers(DEFAULT_USERS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
  }

  const showAlert = (type: 'success' | 'danger' | 'info', text: string) => {
    setAlertMsg({ type, text })
    setTimeout(() => setAlertMsg(null), 4000)
  }

  // Filtered list
  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return users
    return users.filter((u) => {
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
  }, [users, searchTerm])

  // Statistics
  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => u.role === 'ADMIN').length
    const managers = users.filter((u) => u.role === 'MANAGER').length
    const operateurs = users.filter((u) => u.role === 'OPERATEUR').length
    const active = users.filter((u) => u.enabled).length
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0
    return { total, admins, managers, operateurs, active, activeRate }
  }, [users])

  // Toggle user active status
  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = !user.enabled
    const updated = users.map((u) => (u.id === user.id ? { ...u, enabled: newStatus } : u))
    setUsers(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      await axios.patch(`${apiUrl}/users/${user.id}/toggle-status`, {}, { timeout: 2000 })
    } catch (e) {
      // Offline fallback persisted in localStorage
    }

    showAlert(
      newStatus ? 'success' : 'info',
      `Le compte de ${user.fullName} a été ${newStatus ? 'activé avec succès' : 'désactivé'}.`
    )
  }

  // Delete user
  const handleDeleteUser = async (user: UserItem) => {
    if (user.role === 'ADMIN' && stats.admins <= 1) {
      showAlert('danger', "Impossible de supprimer l'unique compte Administrateur du système !")
      return
    }

    if (!window.confirm(`Confirmez-vous la suppression définitive du compte « ${user.fullName} » (${user.username}) ?`)) {
      return
    }

    const updated = users.filter((u) => u.id !== user.id)
    setUsers(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      await axios.delete(`${apiUrl}/users/${user.id}`, { timeout: 2000 })
    } catch (e) {}

    showAlert('success', `Le compte utilisateur « ${user.fullName} » a été supprimé.`)
  }

  // Open Edit Modal
  const openEditModal = (user: UserItem) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      enabled: user.enabled,
    })
    setShowEditModal(true)
  }

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'OPERATEUR',
      enabled: true,
    })
    setShowCreateModal(true)
  }

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      showAlert('danger', 'Veuillez renseigner tous les champs obligatoires.')
      return
    }

    // Check duplicate username or email
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === formData.username.trim().toLowerCase() ||
        u.email.toLowerCase() === formData.email.trim().toLowerCase()
    )
    if (exists) {
      showAlert('danger', "Ce nom d'utilisateur ou cet e-mail est déjà associé à un compte.")
      return
    }

    const newUser: UserItem = {
      id: Date.now(),
      username: formData.username.trim().toLowerCase(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      enabled: formData.enabled,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Jamais connecté',
    }

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const { data } = await axios.post(`${apiUrl}/users`, formData, { timeout: 2500 })
      if (data && data.id) newUser.id = data.id
    } catch (e) {}

    const updated = [newUser, ...users]
    setUsers(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setShowCreateModal(false)
    showAlert('success', `Compte « ${newUser.fullName} » créé avec le rôle ${ROLE_CONFIG[newUser.role].label}.`)
  }

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (!formData.fullName.trim() || !formData.email.trim()) {
      showAlert('danger', 'Veuillez renseigner les champs obligatoires.')
      return
    }

    const updated = users.map((u) => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          enabled: formData.enabled,
        }
      }
      return u
    })

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      await axios.put(`${apiUrl}/users/${editingUser.id}`, formData, { timeout: 2500 })
    } catch (e) {}

    setUsers(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setShowEditModal(false)
    showAlert('success', `Informations et rôle de « ${formData.fullName} » mis à jour.`)
  }

  return (
    <div className='d-flex flex-column gap-6'>
      {/* Alert toast notification */}
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} d-flex align-items-center p-4 rounded-3 shadow-sm border-0 mb-2`}>
          <KTIcon iconName='information' className={`fs-2 me-3 text-${alertMsg.type}`} />
          <div className='fw-bold fs-7'>{alertMsg.text}</div>
        </div>
      )}

      {/* Top Header */}
      <div className='d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3'>
        <h2 className='fw-bolder text-gray-900 fs-3 mb-0'>
          Gestion des Utilisateurs
        </h2>

        <button
          type='button'
          className='btn btn-sm btn-success fw-bold px-4 py-2 d-flex align-items-center shadow-sm'
          onClick={openCreateModal}
        >
          <KTIcon iconName='plus' className='fs-5 me-1 text-white' />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Users Table */}
      <div className='card shadow-sm border-0 bg-white rounded-3 p-6'>
          {/* Search Bar */}
          <div className='d-flex align-items-center justify-content-between mb-6 pb-4 border-bottom'>
            <div className='d-flex align-items-center position-relative' style={{ minWidth: '280px', maxWidth: '400px' }}>
              <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-3 text-gray-400' />
              <input
                type='text'
                className='form-control form-control-sm form-control-solid ps-10 fs-7'
                placeholder='Rechercher un utilisateur...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type='button'
                  className='btn btn-icon btn-sm btn-color-gray-500 btn-active-color-primary position-absolute end-0 me-1'
                  onClick={() => setSearchTerm('')}
                  title='Effacer'
                >
                  <KTIcon iconName='cross' className='fs-4' />
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className='text-center py-12 text-muted'>Chargement...</div>
          ) : filteredUsers.length === 0 ? (
            <div className='text-center py-12 text-muted'>
              <KTIcon iconName='search-list' className='fs-3x text-gray-300 mb-3' />
              <div className='fw-bold fs-6'>Aucun utilisateur trouvé.</div>
            </div>
          ) : (
            <div className='table-responsive'>
              <table className='table table-row-dashed table-row-gray-200 align-middle gs-4 gy-4'>
                <thead>
                  <tr className='fw-bold fs-7 text-uppercase text-muted border-bottom'>
                    <th className='min-w-180px'>Utilisateur</th>
                    <th className='min-w-160px'>Email</th>
                    <th className='min-w-130px'>Rôle</th>
                    <th className='text-end min-w-120px'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const roleCfg = ROLE_CONFIG[u.role]
                    const initials = u.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()

                    return (
                      <tr key={u.id}>
                        {/* Avatar and Name */}
                        <td>
                          <div className='d-flex align-items-center gap-3'>
                            <div
                              className='symbol symbol-40px symbol-circle d-flex align-items-center justify-content-center fw-bolder fs-6'
                              style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className='fw-bolder text-gray-900 fs-6'>{u.fullName}</div>
                              <span className='text-muted fs-8'>Créé le {u.createdAt}</span>
                            </div>
                          </div>
                        </td>

                        {/* Username & Email */}
                        <td>
                          <div className='fw-bold text-gray-800 fs-7'>@{u.username}</div>
                          <div className='text-muted fs-8'>{u.email}</div>
                        </td>

                        {/* RBAC Role */}
                        <td>
                          <div
                            className='badge fw-bold px-3 py-2 fs-8 d-inline-flex align-items-center'
                            style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}
                          >
                            <KTIcon iconName={roleCfg.icon} className='fs-8 me-1' style={{ color: roleCfg.color }} />
                            {roleCfg.label}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className='text-end'>
                          <div className='d-flex justify-content-end align-items-center gap-2'>
                            {/* Toggle Button */}
                            <button
                              type='button'
                              className={`btn btn-icon btn-sm ${u.enabled ? 'btn-light-warning' : 'btn-light-success'}`}
                              onClick={() => handleToggleStatus(u)}
                              title={u.enabled ? 'Désactiver le compte' : 'Activer le compte'}
                            >
                              <KTIcon iconName={u.enabled ? 'cross-circle' : 'check-circle'} className='fs-5' />
                            </button>

                            {/* Edit Button */}
                            <button
                              type='button'
                              className='btn btn-icon btn-sm btn-light-primary'
                              onClick={() => openEditModal(u)}
                              title='Modifier les informations et le rôle'
                            >
                              <KTIcon iconName='pencil' className='fs-5' />
                            </button>

                            {/* Delete Button */}
                            <button
                              type='button'
                              className='btn btn-icon btn-sm btn-light-danger'
                              onClick={() => handleDeleteUser(u)}
                              title='Supprimer définitivement'
                            >
                              <KTIcon iconName='trash' className='fs-5' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal 1: Create User */}
      {showCreateModal && (
        <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content rounded-3 border-0 shadow-lg'>
              <form onSubmit={handleCreateSubmit}>
                <div className='modal-header border-bottom py-4 px-6'>
                  <h4 className='modal-title fw-bolder text-gray-900 fs-4'>
                    <KTIcon iconName='user-tick' className='fs-2 text-success me-2' />
                    Créer un Nouvel Utilisateur
                  </h4>
                  <button
                    type='button'
                    className='btn btn-icon btn-sm btn-light'
                    onClick={() => setShowCreateModal(false)}
                  >
                    <KTIcon iconName='cross' className='fs-3' />
                  </button>
                </div>

                <div className='modal-body p-6 d-flex flex-column gap-4'>
                  <div className='row g-4'>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800 required'>Nom & Prénom</label>
                      <input
                        type='text'
                        className='form-control form-control-solid'
                        placeholder='ex: Salah Mejri'
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800 required'>Nom d'utilisateur</label>
                      <input
                        type='text'
                        className='form-control form-control-solid'
                        placeholder='ex: salah.mejri'
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className='row g-4'>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800 required'>Adresse E-mail</label>
                      <input
                        type='email'
                        className='form-control form-control-solid'
                        placeholder='ex: salah@nexora-industrial.com'
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800 required'>Mot de passe initial</label>
                      <input
                        type='password'
                        className='form-control form-control-solid'
                        placeholder='Minimum 6 caractères'
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* RBAC Role Selection Cards */}
                  <div>
                    <label className='form-label fw-bold fs-7 text-gray-800 required mb-2'>
                      Attribution du Rôle RBAC
                    </label>
                    <div className='row g-3'>
                      {(['OPERATEUR', 'MANAGER', 'ADMIN'] as UserRole[]).map((r) => {
                        const isSelected = formData.role === r
                        const cfg = ROLE_CONFIG[r]
                        return (
                          <div className='col-md-4' key={r}>
                            <div
                              className={`card p-4 rounded-3 cursor-pointer border h-100 ${
                                isSelected ? 'border-2' : 'border-gray-200'
                              }`}
                              style={{
                                borderColor: isSelected ? cfg.color : undefined,
                                backgroundColor: isSelected ? cfg.bg : '#F9F9F9',
                              }}
                              onClick={() => setFormData({ ...formData, role: r })}
                            >
                              <div className='d-flex align-items-center justify-content-between mb-2'>
                                <span className='fw-bolder fs-7' style={{ color: cfg.color }}>
                                  {cfg.label}
                                </span>
                                <input
                                  type='radio'
                                  name='role_select'
                                  checked={isSelected}
                                  onChange={() => setFormData({ ...formData, role: r })}
                                />
                              </div>
                              <span className='fs-8 text-muted'>{cfg.desc}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Status toggle */}
                  <div className='d-flex align-items-center gap-3 p-4 bg-light rounded-3'>
                    <input
                      type='checkbox'
                      id='user_enabled'
                      className='form-check-input'
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                    <label htmlFor='user_enabled' className='fw-bold fs-7 text-gray-900 cursor-pointer mb-0'>
                      Activer immédiatement le compte (l'utilisateur pourra se connecter dès validation)
                    </label>
                  </div>
                </div>

                <div className='modal-footer border-top py-3 px-6'>
                  <button
                    type='button'
                    className='btn btn-sm btn-light fw-bold'
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </button>
                  <button type='submit' className='btn btn-sm btn-success fw-bold px-5'>
                    Enregistrer le compte
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit User */}
      {showEditModal && editingUser && (
        <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content rounded-3 border-0 shadow-lg'>
              <form onSubmit={handleEditSubmit}>
                <div className='modal-header border-bottom py-4 px-6'>
                  <h4 className='modal-title fw-bolder text-gray-900 fs-4'>
                    <KTIcon iconName='pencil' className='fs-2 text-primary me-2' />
                    Modifier l'Utilisateur : {editingUser.fullName}
                  </h4>
                  <button
                    type='button'
                    className='btn btn-icon btn-sm btn-light'
                    onClick={() => setShowEditModal(false)}
                  >
                    <KTIcon iconName='cross' className='fs-3' />
                  </button>
                </div>

                <div className='modal-body p-6 d-flex flex-column gap-4'>
                  <div className='row g-4'>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800 required'>Nom & Prénom</label>
                      <input
                        type='text'
                        className='form-control form-control-solid'
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800'>Nom d'utilisateur (non modifiable)</label>
                      <input
                        type='text'
                        className='form-control form-control-solid bg-light'
                        disabled
                        value={formData.username}
                      />
                    </div>
                  </div>

                  <div className='row g-4'>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800 required'>Adresse E-mail</label>
                      <input
                        type='email'
                        className='form-control form-control-solid'
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label fw-bold fs-7 text-gray-800'>Nouveau mot de passe (optionnel)</label>
                      <input
                        type='password'
                        className='form-control form-control-solid'
                        placeholder='Laisser vide pour ne pas modifier'
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* RBAC Role Selection Cards */}
                  <div>
                    <label className='form-label fw-bold fs-7 text-gray-800 required mb-2'>
                      Modifier le Rôle RBAC
                    </label>
                    <div className='row g-3'>
                      {(['OPERATEUR', 'MANAGER', 'ADMIN'] as UserRole[]).map((r) => {
                        const isSelected = formData.role === r
                        const cfg = ROLE_CONFIG[r]
                        return (
                          <div className='col-md-4' key={r}>
                            <div
                              className={`card p-4 rounded-3 cursor-pointer border h-100 ${
                                isSelected ? 'border-2' : 'border-gray-200'
                              }`}
                              style={{
                                borderColor: isSelected ? cfg.color : undefined,
                                backgroundColor: isSelected ? cfg.bg : '#F9F9F9',
                              }}
                              onClick={() => setFormData({ ...formData, role: r })}
                            >
                              <div className='d-flex align-items-center justify-content-between mb-2'>
                                <span className='fw-bolder fs-7' style={{ color: cfg.color }}>
                                  {cfg.label}
                                </span>
                                <input
                                  type='radio'
                                  name='role_select_edit'
                                  checked={isSelected}
                                  onChange={() => setFormData({ ...formData, role: r })}
                                />
                              </div>
                              <span className='fs-8 text-muted'>{cfg.desc}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Status toggle */}
                  <div className='d-flex align-items-center gap-3 p-4 bg-light rounded-3'>
                    <input
                      type='checkbox'
                      id='user_enabled_edit'
                      className='form-check-input'
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                    <label htmlFor='user_enabled_edit' className='fw-bold fs-7 text-gray-900 cursor-pointer mb-0'>
                      Compte Actif (autoriser l'accès à la plateforme)
                    </label>
                  </div>
                </div>

                <div className='modal-footer border-top py-3 px-6'>
                  <button
                    type='button'
                    className='btn btn-sm btn-light fw-bold'
                    onClick={() => setShowEditModal(false)}
                  >
                    Annuler
                  </button>
                  <button type='submit' className='btn btn-sm btn-primary fw-bold px-5'>
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
