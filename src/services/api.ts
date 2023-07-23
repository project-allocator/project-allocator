import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

const client = applyCaseMiddleware(
  axios.create({
    baseURL: '/api/',
    headers: {
      "Content-Type": "application/json",
    }
  })
);

export default client;