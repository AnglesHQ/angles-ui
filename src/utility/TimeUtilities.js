import moment from 'moment'

const timeUtility = {

  getDuration: function(build) {
    if (build.end && build.start) {
      const start = moment(build.start);
      const end = moment(build.end);
      var duration = moment.duration(end.diff(start));
      return moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
    }
    return 'Not started';
  },
}

export default timeUtility;
