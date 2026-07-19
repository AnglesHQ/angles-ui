import moment from 'moment';

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
