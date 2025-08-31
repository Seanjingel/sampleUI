import axios from '../utils/axiosInstance';

export const login = (credentials) => axios.post('/auth/login', credentials);
export const register = (credentials) => axios.post('/auth/register', credentials);