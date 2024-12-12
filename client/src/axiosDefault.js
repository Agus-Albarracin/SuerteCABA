import axios from 'axios';

const axiosD = axios.create({
  baseURL: 'https://skarybet.com/api', 
  // baseURL: 'http://localhost:3000/api',
  timeout: 60000, //tiempo máximo de espera para las solicitudes
});

export default axiosD;