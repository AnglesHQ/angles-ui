import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { Table } from 'rsuite';
import { getDurationAsString } from '../../../utility/TimeUtilities';
import ExecutionsResultsBar from '../../common/results-bar';

const PlatformMetricsSummary = function (props) {
  const { metrics } = props; // platformColors
  const { Column, HeaderCell, Cell } = Table;

  const generateDeviceMetrics = () => {
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

  const generateTableData = () => {
    const tableArray = [];
    const deviceMetrics = generateDeviceMetrics();
    Object.keys(deviceMetrics).forEach((deviceId, index) => {
      tableArray.push({
        index: index + 1,
        deviceId,
        ...deviceMetrics[deviceId],
      });
    });
    return tableArray;
  };

  /* const platformBackgroundColor = (platform) => {
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
  }; */
  return (
    <div className="metrics-table-wrapper">
      <Table
        data={generateTableData()}
        autoHeight
        id="platform-metrics-table"
        hover={false}
        bordered
      >
        <Column width={40}>
          <HeaderCell>#</HeaderCell>
          <Cell dataKey="index" />
        </Column>
        <Column flexGrow={4}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.platform-metrics-summary.label.platform" />
          </HeaderCell>
          <Cell dataKey="platform.platformName" />
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.platform-metrics-summary.label.version" />
          </HeaderCell>
          <Cell dataKey="platform.platformVersion" />
        </Column>
        <Column flexGrow={4}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.platform-metrics-summary.label.device" />
          </HeaderCell>
          <Cell dataKey="platform.deviceName" />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.platform-metrics-summary.label.total" />
          </HeaderCell>
          <Cell>
            {
              (rowData) => rowData.result.TOTAL
            }
          </Cell>
        </Column>
        <Column flexGrow={4}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.platform-metrics-summary.label.result" />
          </HeaderCell>
          <Cell>
            {
              (rowData) => <ExecutionsResultsBar result={rowData.result} />
            }
          </Cell>
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>
            <FormattedMessage id="page.metrics.platform-metrics-summary.label.duration" />
          </HeaderCell>
          <Cell>
            {
              (rowData) => getDurationAsString(moment.duration(rowData.duration))
            }
          </Cell>
        </Column>
      </Table>
    </div>
  );
};

export default PlatformMetricsSummary;
