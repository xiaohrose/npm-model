import Axios, { AxiosInstance } from 'axios';

export default (() => {
    const Instance = Axios.create({
        baseURL: 'http://localhost:5173'
    })

    Instance.interceptors.response.use((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return res;
    })

    return Instance as AxiosInstance;
})()