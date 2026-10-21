import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import { KTIcon } from '../../../_metronic/helpers'
import { API_BASE_URL, apiErrorMessage } from '../../config'
import { useAuth } from '../../modules/auth'
import { fmtDate } from '../../utils/format'

type UserRole = 'ADMIN' | 'OPERATEUR'

interface UserItem {
  id: number
  username: string
  fullName: string
  email: string
  role: UserRole
  enabled: boolean
  createdAt: string
}

interface UserForm {
  username: string
  fullName: string
  email: string
  password: string
  role: UserRole
  enabled: boolean
}

const MIN_PASSWORD_LENGTH = 8

const ROLES: Record<UserRole, { label: string; color: string; bg: string }> = {
  ADMIN: { label: 'Administrateur', color: '#8950FC', bg: '#EEE5FF' },
  OPERATEUR: { label: 'Opérateur', color: '#50CD89', bg: '#E8FFF3' },
}

const roleOf = (role?: string) => ROLES[(role || '').toUpperCase() as UserRole] || ROLES.OPERATEUR

const EMPTY_FORM: UserForm = { username: '', fullName: '', email: '', password: '', role: 'OPERATEUR', enabled: true }

const getInitials = (name?: string): string => {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  return parts.map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

export default function UserManagementPage() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // null = modal fermé, 'new' = création, sinon l'utilisateur modifié
  const [editing, setEditing] = useState<UserItem | 'new' | null>(null)
  const [formData, setFormData] = useState<UserForm>(EMPTY_FORM)
  const [saving, setSaving] = useState<boolean>(false)
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null)

  const isNew = editing === 'new'
  const isSelf = (u: UserItem) => !!currentUser && u.username.toLowerCase() === currentUser.username.toLowerCase()

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
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
  }, [users, searchTerm])

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const { data } = await axios.patch<UserItem>(`${API_BASE_URL}/users/${user.id}/toggle-status`, {})
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)))
      showAlert(data.enabled ? 'success' : 'info', `Le compte de ${data.fullName} a été ${data.enabled ? 'activé' : 'désactivé'}.`)
    } catch (err) {
      showAlert('danger', apiErrorMessage(err, 'Modification du statut impossible.'))
    }
  }

  const handleDeleteUser = async (user: UserItem) => {
    if (!window.confirm(`Supprimer définitivement le compte « ${user.fullName} » (${user.username}) ?`)) return
    try {
      await axios.delete(`${API_BASE_URL}/users/${user.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      showAlert('success', `Le compte « ${user.fullName} » a été supprimé.`)
    } catch (err) {
      showAlert('danger', apiErrorMessage(err, 'Suppression impossible.'))
    }
  }

  const openCreate = () => {
    setFormData(EMPTY_FORM)
    setEditing('new')
  }

  const openEdit = (user: UserItem) => {
    const { username, fullName, email, role, enabled } = user
    setFormData({ username, fullName, email, role, enabled, password: '' })
    setEditing(user)
  }

  const closeModal = () => {
    if (!saving) setEditing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    if (formData.password && formData.password.length < MIN_PASSWORD_LENGTH) {
      showAlert('danger', `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`)
      return
    }
    setSaving(true)
    try {
      if (editing === 'new') {
        const { data } = await axios.post<UserItem>(`${API_BASE_URL}/users`, formData)
        setUsers((prev) => [data, ...prev])
        showAlert('success', `Compte « ${data.fullName} » créé.`)
      } else {
        const { username, ...payload } = formData
        const { data } = await axios.put<UserItem>(`${API_BASE_URL}/users/${editing.id}`, payload)
        setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
        showAlert('success', `Compte « ${data.fullName} » mis à jour.`)
      }
      setEditing(null)
    } catch (err) {
      showAlert('danger', apiErrorMessage(err, 'Enregistrement impossible.'))
    } finally {
      setSaving(false)
    }
  }

  const setField = <K extends keyof UserForm>(key: K, value: UserForm[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  return (
    <div className='d-flex flex-column gap-6'>
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} d-flex align-items-center p-4 rounded-3 shadow-sm border-0 mb-2`}>
          <KTIcon iconName='information' className={`fs-2 me-3 text-${alertMsg.type}`} />
          <div className='fw-bold fs-7'>{alertMsg.text}</div>
        </div>
      )}

      <div className='d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3'>
        <h2 className='fw-bolder text-gray-900 fs-3 mb-0'>Gestion des Utilisateurs</h2>
        <button
          type='button'
          className='btn btn-sm btn-success fw-bold px-4 py-2 d-flex align-items-center shadow-sm'
          onClick={openCreate}
        >
          <KTIcon iconName='plus' className='fs-5 me-1 text-white' />
          Nouvel utilisateur
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
          </div>
          <span className='text-muted fs-7'>{users.length} compte(s)</span>
        </div>

        {loading ? (
          <div className='text-center py-12 text-muted'>Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <div className='text-center py-12 text-muted fw-bold fs-6'>Aucun utilisateur trouvé.</div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-row-dashed table-row-gray-200 align-middle gs-4 gy-4'>
              <thead>
                <tr className='fw-bold fs-7 text-uppercase text-muted border-bottom'>
                  <th className='min-w-180px'>Utilisateur</th>
                  <th className='min-w-160px'>E-mail</th>
                  <th className='min-w-120px'>Rôle</th>
                  <th className='min-w-100px'>Statut</th>
                  <th className='text-end min-w-120px'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const role = roleOf(u.role)
                  const self = isSelf(u)
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className='d-flex align-items-center gap-3'>
                          <div
                            className='symbol symbol-40px symbol-circle d-flex align-items-center justify-content-center fw-bolder fs-6'
                            style={{ width: 40, height: 40, backgroundColor: role.bg, color: role.color }}
                          >
                            {getInitials(u.fullName || u.username)}
                          </div>
                          <div>
                            <div className='fw-bolder text-gray-900 fs-6'>
                              {u.fullName || u.username}
                              {self && <span className='text-muted fw-normal fs-8 ms-2'>(vous)</span>}
                            </div>
                            <span className='text-muted fs-8'>@{u.username} · créé le {fmtDate(u.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className='text-gray-800 fs-7'>{u.email}</td>
                      <td>
                        <span className='badge fw-bold px-3 py-2 fs-8' style={{ backgroundColor: role.bg, color: role.color }}>
                          {role.label}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fs-8 ${u.enabled ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {u.enabled ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className='text-end'>
                        <div className='d-flex justify-content-end align-items-center gap-2'>
                          <button
                            type='button'
                            className={`btn btn-icon btn-sm ${u.enabled ? 'btn-light-warning' : 'btn-light-success'}`}
                            onClick={() => handleToggleStatus(u)}
                            disabled={self}
                            title={u.enabled ? 'Désactiver' : 'Activer'}
                          >
                            <KTIcon iconName={u.enabled ? 'cross-circle' : 'check-circle'} className='fs-5' />
                          </button>
                          <button
                            type='button'
                            className='btn btn-icon btn-sm btn-light-primary'
                            onClick={() => openEdit(u)}
                            title='Modifier'
                          >
                            <KTIcon iconName='pencil' className='fs-5' />
                          </button>
                          <button
                            type='button'
                            className='btn btn-icon btn-sm btn-light-danger'
                            onClick={() => handleDeleteUser(u)}
                            disabled={self}
                            title='Supprimer'
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

      {editing && (
        <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className='modal-dialog modal-dialog-centered' onClick={(e) => e.stopPropagation()}>
            <div className='modal-content rounded-3 border-0 shadow-lg'>
              <form onSubmit={handleSubmit}>
                <div className='modal-header py-4 px-6'>
                  <h4 className='modal-title fw-bolder text-gray-900 fs-4'>
                    {isNew ? 'Nouvel utilisateur' : 'Modifier l’utilisateur'}
                  </h4>
                  <button type='button' className='btn btn-icon btn-sm btn-light' onClick={closeModal}>
                    <KTIcon iconName='cross' className='fs-3' />
                  </button>
                </div>

                <div className='modal-body px-6 py-5 d-flex flex-column gap-4'>
                  <div>
                    <label className='form-label fw-bold fs-7 required'>Nom complet</label>
                    <input
                      type='text'
                      className='form-control form-control-solid'
                      required
                      value={formData.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={`form-label fw-bold fs-7 ${isNew ? 'required' : ''}`}>Nom d'utilisateur</label>
                    <input
                      type='text'
                      className='form-control form-control-solid'
                      required={isNew}
                      disabled={!isNew}
                      value={formData.username}
                      onChange={(e) => setField('username', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className='form-label fw-bold fs-7 required'>E-mail</label>
                    <input
                      type='email'
                      className='form-control form-control-solid'
                      required
                      value={formData.email}
                      onChange={(e) => setField('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={`form-label fw-bold fs-7 ${isNew ? 'required' : ''}`}>
                      {isNew ? 'Mot de passe' : 'Nouveau mot de passe'}
                    </label>
                    <input
                      type='password'
                      className='form-control form-control-solid'
                      required={isNew}
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete='new-password'
                      value={formData.password}
                      onChange={(e) => setField('password', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className='form-label fw-bold fs-7 required'>Rôle</label>
                    <select
                      className='form-select form-select-solid'
                      value={formData.role}
                      onChange={(e) => setField('role', e.target.value as UserRole)}
                    >
                      <option value='OPERATEUR'>{ROLES.OPERATEUR.label}</option>
                      <option value='ADMIN'>{ROLES.ADMIN.label}</option>
                    </select>
                  </div>
                </div>

                <div className='modal-footer py-3 px-6'>
                  <button type='button' className='btn btn-sm btn-light fw-bold' onClick={closeModal}>
                    Annuler
                  </button>
                  <button type='submit' className='btn btn-sm btn-primary fw-bold px-5' disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
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
