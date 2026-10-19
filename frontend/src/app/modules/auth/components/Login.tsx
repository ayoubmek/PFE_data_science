
import { useState } from 'react'
import { isAxiosError } from 'axios'
import * as Yup from 'yup'
import clsx from 'clsx'
import { useFormik } from 'formik'
import { login, toUserModel } from '../core/_requests'
import { useAuth } from '../core/Auth'

const loginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Minimum 3 caractères')
    .max(100, 'Maximum 100 caractères')
    .required("Nom d'utilisateur requis"),
  password: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .required('Mot de passe requis'),
})

const initialValues = {
  username: '',
  password: '',
}

export function Login() {
  const [loading, setLoading] = useState(false)
  const { saveAuth, setCurrentUser } = useAuth()

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true)
      setStatus(undefined)
      try {
        const { data } = await login(values.username, values.password)
        saveAuth({ api_token: data.token })
        setCurrentUser(toUserModel(data))
      } catch (error) {
        saveAuth(undefined)
        setStatus(
          isAxiosError(error) && error.response?.status === 401
            ? 'Identifiants incorrects ou compte désactivé.'
            : 'Serveur indisponible : impossible de vérifier vos identifiants.'
        )
      } finally {
        setLoading(false)
        setSubmitting(false)
      }
    },
  })

  return (
    <form
      className='form w-100'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      <div className='text-center mb-11'>
        <img
          src='/media/pfe/logo.png'
          alt='Nexora'
          style={{ height: '80px', objectFit: 'contain', marginBottom: '12px' }}
        />
        <h1 className='text-dark fw-bolder mb-1' style={{ fontSize: '22px' }}>Nexora</h1>
        <div className='text-gray-500 fw-semibold fs-7'>Plateforme Intelligente de Gestion Industrielle</div>
      </div>

      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      )}

      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-dark'>Username</label>
        <input
          placeholder='Username'
          {...formik.getFieldProps('username')}
          className={clsx(
            'form-control bg-transparent',
            { 'is-invalid': formik.touched.username && formik.errors.username },
            {
              'is-valid': formik.touched.username && !formik.errors.username,
            }
          )}
          type='text'
          name='username'
          autoComplete='off'
        />
        {formik.touched.username && formik.errors.username && (
          <div className='fv-plugins-message-container'>
            <span role='alert'>{formik.errors.username}</span>
          </div>
        )}
      </div>

      <div className='fv-row mb-3'>
        <label className='form-label fw-bolder text-dark fs-6 mb-0'>Password</label>
        <input
          type='password'
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.password && formik.errors.password,
            },
            {
              'is-valid': formik.touched.password && !formik.errors.password,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>

      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className='indicator-label'>Continue</span>}
          {loading && (
            <span className='indicator-progress' style={{ display: 'block' }}>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>
    </form>
  )
}