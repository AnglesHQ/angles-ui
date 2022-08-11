import {
  CLEAR_CURRENT_ERROR_MESSAGE,
  STORE_CURRENT_ERROR_MESSAGE,
  STORE_CURRENT_WARNING_MESSAGE,
  CLEAR_CURRENT_WARNING_MESSAGE,
} from './notificationActions';

export const notificationReducer = (state = {
  currentErrorMessage: undefined,
  currentWarningMessage: undefined,
}, action) => {
  const { type, payload } = action;
  switch (type) {
    case STORE_CURRENT_ERROR_MESSAGE: {
      const { currentErrorMessage } = payload;
      return { ...state, currentErrorMessage };
    }
    case CLEAR_CURRENT_ERROR_MESSAGE: {
      return { ...state, currentErrorMessage: undefined };
    }
    case STORE_CURRENT_WARNING_MESSAGE: {
      const { currentWarningMessage } = payload;
      return { ...state, currentWarningMessage };
    }
    case CLEAR_CURRENT_WARNING_MESSAGE: {
      return { ...state, currentWarningMessage: undefined };
    }
    default: return state;
  }
};

export default notificationReducer;
