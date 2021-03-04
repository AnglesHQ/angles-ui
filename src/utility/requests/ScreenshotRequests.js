import axios from 'axios';

export const makeGetScreenshotDetails = (buildId, limit) => {
  if (!limit) limit=100;
  return axios.get(`/screenshot/?buildId=${buildId}&limit=${limit}`);
}
