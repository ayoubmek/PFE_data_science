import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import { KTIcon } from '../../../_metronic/helpers'
import { API_BASE_URL, apiErrorMessage } from '../../config'

export type UserRole = 'ADMIN' | 'OPERATEUR'

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




export interface RoleConfigItem {
  label: string
  color: string
  bg: string
  icon: string
  desc: string
}

const ROLE_CONFIG: Record<string, RoleConfigItem> = {
  ADMIN: {
    label: 'Administrateur',
    color: '#8950FC',
    bg: '#EEE5FF',
    icon: 'shield-tick',
    desc: 'Accès total système, gestion des utilisateurs, habilitations RBAC et sécurité.',
  },
  OPERATEUR: {
    label: 'Opérateur',
    color: '#50CD89',
    bg: '#E8FFF3',
    icon: 'gear',
    desc: "Gestion de production, machines, suivi du TRG, mouvements de stock et prévisions d'IA.",
  },
}

const DEFAULT_ROLE_CFG: RoleConfigItem = {
  label: 'Opérateur',
  color: '#50CD89',
  bg: '#E8FFF3',
  icon: 'gear',
  desc: 'Gestion de production et suivi des opérations.',
}

export const getRoleConfig = (role?: string): RoleConfigItem => {
  if (!role) return DEFAULT_ROLE_CFG
  const key = String(role).toUpperCase().trim()
  return ROLE_CONFIG[key] || DEFAULT_ROLE_CFG
}

const getInitials = (name?: string): string => {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  return parts.map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'OPERATEUR' as UserRole,
    enabled: true,
  })

  const showAlert = useCallback((type: 'success' | 'danger' | 'info', text: string) => {
    setAlertMsg({ type, text })
    setTimeout(() => setAlertMsg(null), 4000)
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get<UserItem[]>(`${API_BASE_URL}/users`)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setUsers([])
      showAlert('danger', apiErrorMessage(err, 'Impossible de charger les utilisateurs depuis le serveur.'))
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

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

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => (u.role || '').toUpperCase() === 'ADMIN').length
    const operateurs = users.filter((u) => (u.role || '').toUpperCase() === 'OPERATEUR').length
    const active = users.filter((u) => u.enabled).length
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0
    return { total, admins, operateurs, active, activeRate }
  }, [users])

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const { data } = await axios.patch<UserItem>(`${API_BASE_URL}/users/${user.id}/toggle-status`, {})
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)))
      showAlert(
        data.enabled ? 'success' : 'info',
        `Le compte de ${user.fullName} a été ${data.enabled ? 'activé' : 'désactivé'}.`
      )
    } catch (err) {
      showAlert('danger', apiErrorMessage(err, 'Modification du statut impossible.'))
    }
  }

  const handleDeleteUser = async (user: UserItem) => {
    if (user.role === 'ADMIN' && stats.admins <= 1) {
      showAlert('danger', "Impossible de supprimer l'unique compte Administrateur du système !")
      return
    }

    if (!window.confirm(`Confirmez-vous la suppression définitive du compte « ${user.fullName} » (${user.username}) ?`)) {
      return
    }

    try {
      await axios.delete(`${API_BASE_URL}/users/${user.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      showAlert('success', `Le compte utilisateur « ${user.fullName} » a été supprimé.`)
    } catch (err) {
      showAlert('danger', apiErrorMessage(err, 'Suppression impossible.'))
    }
  }

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim() || !formData.password) {
      showAlert('danger', 'Veuillez renseigner tous les champs obligatoires (mot de passe compris).')
      return
    }
    try {
      const { data } = await axios.post<UserItem>(`${API_BASE_URL}/users`, formData)
      setUsers((prev) => [data, ...prev])
      setShowCreateModal(false)
      showAlert('success', `Compte « ${data.fullName} » créé avec le rôle ${getRoleConfig(data.role).label}.`)
    } catch (err) {
      showAlert('danger', apiErrorMessage(err, 'Création du compte impossible.'))
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (!formData.fullName.trim() || !formData.email.trim()) {
      showAlert('danger', 'Veuillez renseigner les champs obligatoires.')
      return
    }
    try {
      const { data } = await axios.put<UserItem>(`${API_BASE_URL}/users/${editingUser.id}`, formData)
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
      setShowEditModal(false)
      showAlert('success', `Informations et rôle de « ${data.fullName} » mis à jour.`)
    } catch (err) {
      showAlert('danger', apiErrorMessage(err, 'Mise à jour impossible.'))
    }
  }

  return (
    <div className='d-flex flex-column gap-6'>
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} d-flex align-items-center p-4 rounded-3 shadow-sm border-0 mb-2`}>
          <KTIcon iconName='information' className={`fs-2 me-3 text-${alertMsg.type}`} />
          <div className='fw-bold fs-7'>{alertMsg.text}</div>
        </div>
      )}

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

      <div className='card shadow-sm border-0 bg-white rounded-3 p-6'>
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
                    const roleCfg = getRoleConfig(u.role)
                    const initials = getInitials(u.fullName || u.username)

                    return (
                      <tr key={u.id}>
                        <td>
                          <div className='d-flex align-items-center gap-3'>
                            <div
                              className='symbol symbol-40px symbol-circle d-flex align-items-center justify-content-center fw-bolder fs-6'
                              style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className='fw-bolder text-gray-900 fs-6'>{u.fullName || u.username}</div>
                              <span className='text-muted fs-8'>Créé le {u.createdAt || '-'}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className='fw-bold text-gray-800 fs-7'>@{u.username}</div>
                          <div className='text-muted fs-8'>{u.email}</div>
                        </td>

                        <td>
                          <div
                            className='badge fw-bold px-3 py-2 fs-8 d-inline-flex align-items-center'
                            style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}
                          >
                            <KTIcon iconName={roleCfg.icon} className='fs-8 me-1' style={{ color: roleCfg.color }} />
                            {roleCfg.label}
                          </div>
                        </td>

                        <td className='text-end'>
                          <div className='d-flex justify-content-end align-items-center gap-2'>
                            <button
                              type='button'
                              className={`btn btn-icon btn-sm ${u.enabled ? 'btn-light-warning' : 'btn-light-success'}`}
                              onClick={() => handleToggleStatus(u)}
                              title={u.enabled ? 'Désactiver le compte' : 'Activer le compte'}
                            >
                              <KTIcon iconName={u.enabled ? 'cross-circle' : 'check-circle'} className='fs-5' />
                            </button>

                            <button
                              type='button'
                              className='btn btn-icon btn-sm btn-light-primary'
                              onClick={() => openEditModal(u)}
                              title='Modifier les informations et le rôle'
                            >
                              <KTIcon iconName='pencil' className='fs-5' />
                            </button>

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

                  <div>
                    <label className='form-label fw-bold fs-7 text-gray-800 required mb-2'>
                      Attribution du Rôle RBAC
                    </label>
                    <div className='row g-3'>
                      {(['OPERATEUR', 'ADMIN'] as UserRole[]).map((r) => {
                        const isSelected = formData.role === r
                        const cfg = getRoleConfig(r)
                        return (
                          <div className='col-md-6' key={r}>
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

                  <div>
                    <label className='form-label fw-bold fs-7 text-gray-800 required mb-2'>
                      Modifier le Rôle RBAC
                    </label>
                    <div className='row g-3'>
                      {(['OPERATEUR', 'ADMIN'] as UserRole[]).map((r) => {
                        const isSelected = formData.role === r
                        const cfg = getRoleConfig(r)
                        return (
                          <div className='col-md-6' key={r}>
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
