import React from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
// import { Redirect } from 'react-router-dom'

import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CRow } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faKey, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import ReCAPTCHA from 'react-google-recaptcha'

import sweetalert2 from 'src/components/custom/Sweetalert2'
import axios from 'axios'

const Login = ({ history }) => {
  const dispatch = useDispatch()
  const variables = useSelector((state) => state.variables)
  const user_data = useSelector((state) => state.user_data)
  const access_token = useSelector((state) => state.access_token)

  const [isCaptchaValid, setIsCaptchaValid] = React.useState(false)
  const [is_loading_login, setIs_loading_login] = React.useState(false)
  const [input_email, setInput_email] = React.useState('')
  const [input_password, setInput_password] = React.useState('')

  const logIn = (data = {}) => {
    setIs_loading_login(true)
    axios({
      method: 'post',
      baseURL: variables.api_base_url,
      url: 'api/cms/login',
      data,
    }).then(
      (result) => {
        setIs_loading_login(false)

        const { data } = result

        Promise.all([
          localStorage.setItem('user_data', JSON.stringify(data.data)),
          localStorage.setItem('access_token', data.access_token),
          dispatch({ type: 'set', user_data: data.data }),
          dispatch({ type: 'set', access_token: data.access_token }),
        ]).then(() => {
          history.push('/welcome')
        })
      },
      (e) => {
        setIs_loading_login(false)

        sweetalert2.fire({
          text: e.message || e.status,
          icon: 'error',
        })
      },
    )
  }

  React.useEffect(() => {
    if (user_data && access_token) {
      history.push('/welcome')
    }
  }, [access_token, user_data, history])

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="p-4">
              <CCardBody>
                <CForm>
                  <h2>Login</h2>
                  <p className="text-medium-emphasis">Silakan login menggunakan akun anda</p>
                  <div className="input-group-icon mb-3">
                    <FontAwesomeIcon icon={faEnvelope} className="icon" />
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      value={input_email}
                      onChange={(e) => setInput_email(e.target.value)}
                    />
                  </div>
                  <div className="input-group-icon mb-4">
                    <FontAwesomeIcon icon={faKey} className="icon" />
                    <CFormInput
                      type="password"
                      placeholder="Kata Sandi"
                      autoComplete="current-password"
                      value={input_password}
                      onChange={(e) => setInput_password(e.target.value)}
                    />
                  </div>
                  <CRow className="mb-4">
                    <CCol xs={12}>
                      <ReCAPTCHA
                        hl="id"
                        sitekey="6Ld7tZQaAAAAAOXx_ayVLDSUQohF4lsw2LvLtV0g"
                        onChange={(value) => {
                          if (value) {
                            setIsCaptchaValid(true)
                          } else {
                            setIsCaptchaValid(false)
                          }
                        }}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol xs={6}>
                      <CButton
                        color="primary"
                        className="px-4"
                        disabled={
                          !isCaptchaValid || !input_email || !input_password || is_loading_login
                        }
                        onClick={() => {
                          logIn({
                            main_dealer_id: variables.main_dealer_id,
                            email: input_email,
                            password: input_password,
                          })
                        }}
                      >
                        {is_loading_login ? (
                          <>
                            <FontAwesomeIcon icon={faCircleNotch} spin />{' '}
                          </>
                        ) : (
                          ''
                        )}
                        Login
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-end">
                      <CButton color="link" className="px-0">
                        Forgot password?
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

Login.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
}

export default Login
