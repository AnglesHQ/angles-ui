import moment from 'moment'


export const getDuration = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    var duration = moment.duration(end.diff(start));
    if (duration.asSeconds() < 120) {
      return `${Math.floor(duration.asSeconds())} seconds`;
    } else if (duration.asSeconds() >= 120 && duration.asMinutes() < 120) {
      return `${Math.floor(duration.asMinutes())} minutes`;
    } else {
      return `${duration.asHours()} hours`
    }
  }
  return 'Not started';
}

export const getBuildDurationInMinutes = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    var duration = moment.duration(end.diff(start));
    return duration.asMinutes();
  }
  return 0;
}

export const getBuildDurationInSeconds = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    var duration = moment.duration(end.diff(start));
    return Math.floor(duration.asSeconds());
  }
  return 0;
}
