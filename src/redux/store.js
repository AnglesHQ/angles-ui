import { createStore, combineReducers } from 'redux';
import { teamsReducer } from './teamReducers';
import { environmentsReducer } from './environmentReducers';
import { buildReducer } from './buildReducers';

const reducers = {
  teamsReducer,
  environmentsReducer,
  buildReducer,
};
const rootReducer = combineReducers(reducers);

const store = createStore(rootReducer);

export default store;
