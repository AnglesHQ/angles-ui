import moment from 'moment';

export const getDurationAsString = (duration) => {
  if (duration.asSeconds() < 120) {
    return `${Math.floor(duration.asSeconds())} seconds`;
  }
  if (duration.asSeconds() >= 120 && duration.asMinutes() < 120) {
    return `${Math.floor(duration.asMinutes())} minutes`;
  }
  return `${Math.floor(duration.asHours())} hours`;
};

export const getDuration = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    const duration = moment.duration(end.diff(start));
    return getDurationAsString(duration);
  }
  return 'Not started';
};

export const getBuildDurationInMinutes = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    const duration = moment.duration(end.diff(start));
    return duration.asMinutes();
  }
  return 0;
};

export const getBuildDurationInSeconds = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    const duration = moment.duration(end.diff(start));
    return Math.floor(duration.asSeconds());
  }
  return 0;
};

export const getDateRangesPicker = () => [
  {
    label: 'Last 7 days',
    value: [moment(new Date()).subtract(6, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
  {
    label: 'Last 14 days',
    value: [moment(new Date()).subtract(13, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
  {
    label: 'Last 30 days',
    value: [moment(new Date()).subtract(29, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
  {
    label: 'Last 90 days',
    value: [moment(new Date()).subtract(89, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
];
