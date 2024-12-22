import axios from 'axios';

const axiosD = axios.create({
  baseURL: 'https://suerte24.bet/api', 
  // baseURL: 'http://localhost:3004/api',
  timeout: 60000, //tiempo máximo de espera para las solicitudes
});

export default axiosD;