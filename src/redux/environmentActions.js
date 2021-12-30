export const STORE_ENVIRONMENTS = 'STORE_ENVIRONMENTS';
export const storeEnvironments = (environments) => ({
  type: STORE_ENVIRONMENTS,
  payload: { environments },
});
