import axios from '../utils/axiosInstance';

export const getAccountDetails = () => axios.get('/account');
export const updateProfile = (profileData) => axios.put('/account/update-account', profileData);   

