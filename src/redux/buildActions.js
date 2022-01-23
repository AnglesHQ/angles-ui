export const STORE_BUILDS = 'STORE_BUILDS';
export const storeBuilds = (builds) => ({
  type: STORE_BUILDS,
  payload: { builds },
});
