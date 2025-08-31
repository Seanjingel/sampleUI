import axiosInstance from '../utils/axiosInstance';
const API_BASE_URL = '/trade';

export const getAllTrades = () => axiosInstance.get(`${API_BASE_URL}`);
export const addTrade = (trade) => axiosInstance.post(`${API_BASE_URL}`, trade);
export const updateTrade = (id, trade) => axiosInstance.put(`${API_BASE_URL}/${id}`, trade);
export const deleteTrade = (id) => axiosInstance.delete(`${API_BASE_URL}/${id}`);
export const importTrades = (formData) => axiosInstance.post(`${API_BASE_URL}/import`, formData);
export const getTradeByRange = (startDate, endDate) => {
    return axiosInstance.get(`${API_BASE_URL}/date-range`, {
        params: {
            startDate,
            endDate
        }
    });
};
export const getTradeById = (id) => axiosInstance.get(`${API_BASE_URL}/${id}`).then(res => res.data);

// Single exit update helper (used for exiting/partial exiting a trade)
export const exitTrade = async (tradeId, exitData) => {
    const response = await axiosInstance.put(`${API_BASE_URL}/${tradeId}`, {
        exitPrice: exitData.price,
        exitQuantity: exitData.quantity,
        exitDate: exitData.date || new Date().toISOString()
    });
    return response.data;
};
