import { createStore, combineReducers } from 'redux';
import { teamsReducer } from './teamReducers';
import { environmentsReducer } from './environmentReducers';
import { buildReducer } from './buildReducers';
import { notificationReducer } from './notificationReducers';

const reducers = {
  teamsReducer,
  environmentsReducer,
  buildReducer,
  notificationReducer,
};
const rootReducer = combineReducers(reducers);

const store = createStore(rootReducer);

export default store;
