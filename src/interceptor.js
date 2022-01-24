import axios from 'axios'
import sweetalert2 from 'src/components/custom/Sweetalert2'

const error_codes = [
  { code: 105, message: 'Email tidak terdaftar' },
  { code: 106, message: 'Email dan kata sandi tidak sesuai' },
]

let swalSession = sweetalert2

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    const { data } = response
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // 1996 = Session expired
    if (parseInt(data.code) === 1996) {
      if (!swalSession.isVisible()) {
        swalSession.fire({
          text: 'Sesi telah berakhir, silakan login kembali',
          icon: 'error',
        })
        window.location.href = '/#/logout?force=true'
      }

      // Promise.all([
      //   localStorage.removeItem('user_data'),
      //   localStorage.removeItem('access_token'),
      // ]).then(() => {
      //   // window.location.href = '/#/login'
      // })
    }
    // Check if any error codes found
    const error = error_codes.filter((o) => o.code === parseInt(data.code))
    if (error.length) {
      return Promise.reject({ ...data, message: error[0].message })
    }

    return response
  },
  function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message)
    }
    console.log(error.config)

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)
