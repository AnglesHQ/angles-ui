import { STORE_ENVIRONMENTS } from './environmentActions';

export const environmentsReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case STORE_ENVIRONMENTS: {
      const { environments } = payload;
      return { ...state, environments };
    }
    default: return state;
  }
};

export default environmentsReducer;
