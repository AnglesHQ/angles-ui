import { STORE_CURRENT_TEAM, STORE_TEAMS, STORE_TEAMS_ERROR } from './teamActions';

export const teamsReducer = (state = {
  teams: {},
  currentTeam: undefined,
  teamsError: undefined,
}, action) => {
  const { type, payload } = action;
  switch (type) {
    case STORE_CURRENT_TEAM: {
      const { currentTeam } = payload;
      return { ...state, currentTeam };
    }
    case STORE_TEAMS: {
      const { teams } = payload;
      return { ...state, teams };
    }
    case STORE_TEAMS_ERROR: {
      const { teamsError } = payload;
      return { ...state, teamsError };
    }
    default: return state;
  }
};

export default teamsReducer;
