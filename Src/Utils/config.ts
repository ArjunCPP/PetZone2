import * as Keychain from 'react-native-keychain';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const constants = {
    baseURL: "https://pet-booking-icyh.onrender.com/api/v1"
};

export const axiosInstance: AxiosInstance = axios.create({
    baseURL: constants.baseURL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
    },
});

export const multiPartAxiosInstance: AxiosInstance = axios.create({
    baseURL: constants.baseURL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
    },
});

const injectToken = async (config: InternalAxiosRequestConfig) => {
    try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials && credentials.password) {
            config.headers.Authorization = `Bearer ${credentials.password}`;
        }
    } catch (error) {
        console.error('Keychain Access Error:', error);
    }
    console.log(`🚀 Calling API: ${config.baseURL}${config.url}`);
    return config;
};

axiosInstance.interceptors.request.use(injectToken, (error) => Promise.reject(error));
multiPartAxiosInstance.interceptors.request.use(injectToken, (error) => Promise.reject(error));


axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized: Token might be expired.');
        }
        return Promise.reject(error);
    }
);

export { axiosInstance as axios, multiPartAxiosInstance as multiPartAxios };