import { STORE_BUILDS } from './buildActions';

export const buildReducer = (state = {}, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case STORE_BUILDS: {
      const { builds } = payload;
      return { ...state, builds };
    }
    default: return state;
  }
};

export default buildReducer;
