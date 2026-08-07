import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Table } from 'rsuite';
// import '../pages/Default.css';
import { getDuration } from '../../../utility/TimeUtilities';

const TestDetailsTable = function (props) {
  const { execution } = props;
  const intl = useIntl();
  const { Column, HeaderCell, Cell } = Table;

  const getFirstTestStepByStatus = (executionWithSteps, status) => {
    /* eslint consistent-return: [0] */
    const failingActions = executionWithSteps.actions.filter((action) => action.status === status);
    if (failingActions.length > 0) {
      const failingSteps = failingActions[0].steps.filter((step) => step.status === status);
      if (failingSteps.length > 0) {
        const step = failingSteps[0];
        if (step.info !== '') {
          return step.info;
        }
        return step.name;
      }
    }
    return '';
  };

  const generateTestDetailsData = (currentExecution) => {
    const dataArray = [];
    const { platforms, status } = currentExecution;
    dataArray.push({
      property: intl.formatMessage({ id: 'page.test-run-compare.details-popover.property.status' }),
      value: status,
    });
    dataArray.push({
      property: intl.formatMessage({ id: 'page.test-run-compare.details-popover.property.duration' }),
      value: getDuration(currentExecution),
    });

    if (platforms && platforms.length > 0) {
      let platformIdentifier = '';
      platforms.forEach((platform) => {
        if (platform.deviceName) {
          platformIdentifier = `${platform.deviceName} (${platform.platformName})`;
        } else {
          platformIdentifier = `${platform.browserName} ${platform.browserVersion} (${platform.platformName})`;
        }
      });
      dataArray.push({
        property: intl.formatMessage({ id: 'page.test-run-compare.details-popover.property.platform' }),
        value: platformIdentifier,
      });
    }
    if (status && (status === 'ERROR' || status === 'FAIL')) {
      dataArray.push({
        property: intl.formatMessage({ id: 'page.test-run-compare.details-popover.property.failing-step' }),
        value: getFirstTestStepByStatus(currentExecution, status),
      });
    }
    return dataArray;
  };

  return (
    <Table
      data={generateTestDetailsData(execution)}
      hover={false}
      autoHeight
    >
      <Column flexGrow={1}>
        <HeaderCell><FormattedMessage id="page.test-run-compare.details-popover.header.property" /></HeaderCell>
        <Cell dataKey="property" />
      </Column>
      <Column flexGrow={2}>
        <HeaderCell><FormattedMessage id="page.test-run-compare.details-popover.header.value" /></HeaderCell>
        <Cell dataKey="value" />
      </Column>
    </Table>
  );
};

export default TestDetailsTable;
