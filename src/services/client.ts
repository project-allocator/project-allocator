import axios from 'axios';

// TODO: Replace this with axios functions
export function getData(): any { }

const client = axios.create({ baseURL: '/api' });

export default client;