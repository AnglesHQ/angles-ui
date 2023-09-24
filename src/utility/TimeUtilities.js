import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

export const getDurationAsString = (duration) => {
  if (duration.asSeconds() < 120) {
    return (
      <FormattedMessage
        id="app.utils.duration.seconds"
        values={{ seconds: Math.floor(duration.asSeconds()) }}
      />
    );
  }
  if (duration.asSeconds() >= 120 && duration.asMinutes() < 120) {
    return (
      <FormattedMessage
        id="app.utils.duration.minutes"
        values={{ minutes: Math.floor(duration.asMinutes()) }}
      />
    );
  }
  return (
    <FormattedMessage
      id="app.utils.duration.hours"
      values={{ hours: Math.floor(duration.asHours()) }}
    />
  );
};

export const getDuration = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    const duration = moment.duration(end.diff(start));
    return getDurationAsString(duration);
  }
  return (
    <FormattedMessage
      id="app.utils.duration.not-started"
    />
  );
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
    label: <FormattedMessage id="app.utils.date-range-picker.number-of-days" values={{ days: 7 }} />,
    value: [moment(new Date()).subtract(6, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
  {
    label: <FormattedMessage id="app.utils.date-range-picker.number-of-days" values={{ days: 14 }} />,
    value: [moment(new Date()).subtract(13, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
  {
    label: <FormattedMessage id="app.utils.date-range-picker.number-of-days" values={{ days: 30 }} />,
    value: [moment(new Date()).subtract(29, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
  {
    label: <FormattedMessage id="app.utils.date-range-picker.number-of-days" values={{ days: 90 }} />,
    value: [moment(new Date()).subtract(89, 'days').toDate(), moment(new Date()).toDate()],
    placement: 'bottom',
  },
];
