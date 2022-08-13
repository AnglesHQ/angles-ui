import {
  CLEAR_CURRENT_ERROR_MESSAGE,
  STORE_CURRENT_ERROR_MESSAGE,
  STORE_CURRENT_INFO_MESSAGE,
  CLEAR_CURRENT_INFO_MESSAGE,
} from './notificationActions';

export const notificationReducer = (state = {
  currentErrorMessage: undefined,
  currentInfoMessage: undefined,
}, action) => {
  const { type, payload } = action;
  switch (type) {
    case STORE_CURRENT_ERROR_MESSAGE: {
      const { currentErrorMessage } = payload;
      return { ...state, currentErrorMessage, currentInfoMessage: undefined };
    }
    case CLEAR_CURRENT_ERROR_MESSAGE: {
      return { ...state, currentErrorMessage: undefined };
    }
    case STORE_CURRENT_INFO_MESSAGE: {
      const { currentInfoMessage } = payload;
      return { ...state, currentInfoMessage, currentErrorMessage: undefined };
    }
    case CLEAR_CURRENT_INFO_MESSAGE: {
      return { ...state, currentInfoMessage: undefined };
    }
    default: return state;
  }
};

export default notificationReducer;
