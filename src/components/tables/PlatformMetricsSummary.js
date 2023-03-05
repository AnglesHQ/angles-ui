import React from 'react';
import moment from 'moment';
import { getDurationAsString } from '../../utility/TimeUtilities';

const PlatformMetricsSummary = function (props) {
  const generateDeviceMetrics = (metrics) => {
    const deviceMetrics = {};
    metrics.periods.forEach((period) => {
      period.phases.forEach((phase) => {
        phase.executions.forEach((execution) => {
          if (execution.platforms && execution.platforms.length > 0) {
            execution.platforms.forEach((platform) => {
              if (platform.platformName) {
                let platformId = 'undefined';
                // if (['ios', 'android'].includes(platform.platformName.toLocaleLowerCase()) {
                if (platform.deviceName) {
                  platformId = platform.deviceName;
                } else {
                  platformId = platform.platformName;
                  if (platform.platformVersion) {
                    platformId += `_${platform.platformVersion}`;
                  }
                  if (platform.platformVersion) {
                    platformId += `_${platform.platformVersion}`;
                  }
                }
                if (!deviceMetrics[platformId]) {
                  deviceMetrics[platformId] = {
                    platform,
                    result: {
                      PASS: 0,
                      FAIL: 0,
                      ERROR: 0,
                      SKIPPED: 0,
                      TOTAL: 0,
                    },
                    duration: 0,
                  };
                }
                deviceMetrics[platformId].result[execution.status] += 1;
                deviceMetrics[platformId].result.TOTAL += 1;
                if (execution.end && execution.start) {
                  const start = moment(execution.start);
                  const end = moment(execution.end);
                  const executionDuration = moment.duration(end.diff(start));
                  deviceMetrics[platformId].duration += executionDuration;
                }
              }
            });
          }
        });
      });
    });
    return deviceMetrics;
  };

  const platformBackgroundColor = (platform, platformColors) => {
    const hex = platformColors[platform.platformName].color;
    hex.replace('#', '');
    let r = 0; let g = 0; let b = 0;
    if (hex.length === 4) {
      r = `0x${hex[1]}${hex[1]}`;
      g = `0x${hex[2]}${hex[2]}`;
      b = `0x${hex[3]}${hex[3]}`;
    } else if (hex.length === 7) {
      r = `0x${hex[1]}${hex[2]}`;
      g = `0x${hex[3]}${hex[4]}`;
      b = `0x${hex[5]}${hex[6]}`;
    }
    return `rgb(${+r},${+g},${+b}, 0.4)`;
  };

  const generateDeviceRows = () => {
    const { metrics, platformColors } = props;
    const deviceRows = [];
    const deviceMetrics = generateDeviceMetrics(metrics);
    Object.keys(deviceMetrics).forEach((deviceId, index) => {
      const { platform, result, duration } = deviceMetrics[deviceId];
      if (platform) {
        deviceRows.push(
          <tr
            key={deviceId}
            style={
              {
                fontWeight: 'bold',
                backgroundColor: platformBackgroundColor(platform, platformColors),
              }
            }
          >
            <th scope="row">{index + 1}</th>
            <td>{ platform.platformName }</td>
            <td>{ platform.platformVersion }</td>
            <td>{ platform.deviceName }</td>
            <td>{ getDurationAsString(moment.duration(duration)) }</td>
            <td>{result.PASS}</td>
            <td>{result.FAIL}</td>
            <td>{result.ERROR}</td>
            <td>{result.SKIPPED}</td>
            <td>{result.TOTAL}</td>
          </tr>,
        );
      }
    });
  };

  return (
    <div className="metrics-table-wrapper">
      <table className="table fixed-header">
        <thead className="thead-dark metrics-table-head">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Platform</th>
            <th scope="col">Platform Version</th>
            <th scope="col">Device</th>
            <th scope="col">Duration</th>
            <th scope="col">Pass</th>
            <th scope="col">Fail</th>
            <th scope="col">Error</th>
            <th scope="col">Skipped</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody className="metrics-table-body">
          {
            generateDeviceRows()
          }
        </tbody>
      </table>
    </div>
  );
};

export default PlatformMetricsSummary;
