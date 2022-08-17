export const STORE_CURRENT_ERROR_MESSAGE = 'STORE_CURRENT_ERROR_MESSAGE';
export const storeCurrentErrorMessage = (currentErrorMessage) => ({
  type: STORE_CURRENT_ERROR_MESSAGE,
  payload: { currentErrorMessage },
});

export const CLEAR_CURRENT_ERROR_MESSAGE = 'CLEAR_CURRENT_ERROR_MESSAGE';
export const clearCurrentErrorMessage = () => ({
  type: CLEAR_CURRENT_ERROR_MESSAGE,
});

export const STORE_CURRENT_INFO_MESSAGE = 'STORE_CURRENT_INFO_MESSAGE';
export const storeCurrentInfoMessage = (currentInfoMessage) => ({
  type: STORE_CURRENT_INFO_MESSAGE,
  payload: { currentInfoMessage },
});

export const CLEAR_CURRENT_INFO_MESSAGE = 'CLEAR_CURRENT_INFO_MESSAGE';
export const clearCurrentInfoMessage = () => ({
  type: CLEAR_CURRENT_INFO_MESSAGE,
});

export const STORE_CURRENT_LOADER_MESSAGE = 'STORE_CURRENT_LOADER_MESSAGE';
export const storeCurrentLoaderMessage = (currentLoaderMessage) => ({
  type: STORE_CURRENT_LOADER_MESSAGE,
  payload: { currentLoaderMessage },
});

export const CLEAR_CURRENT_LOADER_MESSAGE = 'CLEAR_CURRENT_LOADER_MESSAGE';
export const clearCurrentLoaderMessage = () => ({
  type: CLEAR_CURRENT_LOADER_MESSAGE,
});
