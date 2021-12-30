export const STORE_CURRENT_TEAM = 'STORE_CURRENT_TEAM';
export const storeCurrentTeam = (currentTeam) => ({
  type: STORE_CURRENT_TEAM,
  payload: { currentTeam },
});

export const STORE_TEAMS = 'STORE_TEAMS';
export const storeTeams = (teams) => ({
  type: STORE_TEAMS,
  payload: { teams },
});

export const STORE_TEAMS_ERROR = 'STORE_TEAMS_ERROR';
export const storeTeamsError = (teamsError) => ({
  type: STORE_TEAMS_ERROR,
  payload: { teamsError },
});
