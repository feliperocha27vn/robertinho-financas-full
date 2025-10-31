import axios from 'axios'

const api = axios.create({
  baseURL: process.env.WEBHOOK_API_URL || 'http://192.168.0.101:3333',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
