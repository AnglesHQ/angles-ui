import moment from 'moment';

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
