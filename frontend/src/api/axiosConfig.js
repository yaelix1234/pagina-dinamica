import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    Authorization: 'Token f8da5fdd1e96b78366358bfd0e28f911d48bcc2b',
  },
});

export default api;