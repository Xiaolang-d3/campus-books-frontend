import axios from 'axios'
import router from '@/router'

const clearAuthStorage = () => {
  ;['token', 'role', 'tableName', 'userid', 'username', 'avatar'].forEach(key => {
    localStorage.removeItem(key)
  })
}

const http = axios.create({
  timeout: 86400000,
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json; charset=utf-8' }
})

http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  response => {
    if (response.data && response.data.code === 401) {
      clearAuthStorage()
      router.push('/login')
    }
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      clearAuthStorage()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default http
