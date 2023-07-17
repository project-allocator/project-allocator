import axios from 'axios';
import process from 'process';

// TODO: Replace this with axios functions
export function getData(): any { }


const client = axios.create({
  baseURL: process.env.NODE_ENV == 'production'
    ? 'http://example.com/'
    : 'http://localhost:8000/'
});
client.interceptors.request.use((config) => {
  // TODO: Add auth code here
  return config;
})
client.interceptors.response.use((response) => {
  // TODO: Add message code here
  return response;
})

export default client;