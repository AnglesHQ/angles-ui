import axios from 'axios';

export default (buildId, limit) => {
  let defaultLimit = 100;
  if (limit) {
    defaultLimit = limit;
  }
  return axios.get(`/screenshot/?buildId=${buildId}&limit=${defaultLimit}`);
};
