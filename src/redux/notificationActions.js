export const STORE_CURRENT_ERROR_MESSAGE = 'STORE_CURRENT_ERROR_MESSAGE';
export const storeCurrentErrorMessage = (currentErrorMessage) => ({
  type: STORE_CURRENT_ERROR_MESSAGE,
  payload: { currentErrorMessage },
});

export const CLEAR_CURRENT_ERROR_MESSAGE = 'CLEAR_CURRENT_ERROR_MESSAGE';
export const clearCurrentErrorMessage = () => ({
  type: CLEAR_CURRENT_ERROR_MESSAGE,
});

export const STORE_CURRENT_WARNING_MESSAGE = 'STORE_CURRENT_WARNING_MESSAGE';
export const storeCurrentWarningMessage = (currentWarningMessage) => ({
  type: STORE_CURRENT_WARNING_MESSAGE,
  payload: { currentWarningMessage },
});

export const CLEAR_CURRENT_WARNING_MESSAGE = 'CLEAR_CURRENT_WARNING_MESSAGE';
export const clearCurrentWarningMessage = () => ({
  type: CLEAR_CURRENT_WARNING_MESSAGE,
});
