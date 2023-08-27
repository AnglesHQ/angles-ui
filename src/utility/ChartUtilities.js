import moment from 'moment';
import { getBuildDurationInSeconds } from './TimeUtilities';

export const getRandomColor = (arraySize) => {
  const letters = '0123456789ABCDEF'.split('');
  const colorsArray = [];
  for (let i = 0; i < arraySize; i += 1) {
    let color = '#';
    for (let j = 0; j < 6; j += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    colorsArray.push(color);
  }
  return colorsArray;
};

export const getPeriodLabel = (period, groupingPeriod) => {
  if (groupingPeriod === 'month') {
    return (`${moment.utc(moment(period.start)).format('MMMM (YYYY)')}`);
  }
  if (groupingPeriod === 'year') {
    return (`${moment.utc(moment(period.start)).format('YYYY')}`);
  }
  if (groupingPeriod === 'day' || groupingPeriod === 1) {
    return (`${moment.utc(moment(period.start)).format('DD-MM-YYYY')}`);
  }
  return (`${moment.utc(moment(period.start)).format('DD-MM-YYYY')} - ${moment.utc(moment(period.end)).format('DD-MM-YYYY')}`);
};

export const generateResultsData = (builds) => {
  const graphData = {
    data: [],
    labels: [],
  };
  const results = {
    PASS: [],
    SKIPPED: [],
    ERROR: [],
    FAIL: [],
    executionTimes: [],
  };
  builds.forEach((build) => {
    const {
      PASS,
      SKIPPED,
      ERROR,
      FAIL,
    } = build.result;
    results.PASS.push(PASS);
    results.SKIPPED.push(SKIPPED);
    results.ERROR.push(ERROR);
    results.FAIL.push(FAIL);
    results.executionTimes.push(getBuildDurationInSeconds(build));
    graphData.labels.push(moment(build.start).format('YYYY-MM-DD hh:mm:ss'));
  });
  graphData.data.push(
    { name: 'Pass', data: results.PASS, type: 'column' },
    { name: 'Skipped', data: results.SKIPPED, type: 'column' },
    { name: 'Error', data: results.ERROR, type: 'column' },
    { name: 'Fail', data: results.FAIL, type: 'column' },
    { name: 'ExecutionTime', data: results.executionTimes, type: 'line' },
  );
  return graphData;
};
