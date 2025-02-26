
import axios from './base';

export function getChatHistory() {
    return axios.get('/api/chats')
}

export function getChatHistoryItem(file: string) {
    return axios.get(`/api/chats/${file}`)
}