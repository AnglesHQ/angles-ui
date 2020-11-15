import moment from 'moment'


export const getDuration = (build) => {
  if (build.end && build.start) {
    const start = moment(build.start);
    const end = moment(build.end);
    var duration = moment.duration(end.diff(start));
    return moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
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
