import React from 'react';
import { Table } from 'rsuite';
// import '../pages/Default.css';
import { getDuration } from '../../utility/TimeUtilities';

const TestDetailsTable = function (props) {
  const { execution } = props;
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
      property: 'Status',
      value: status,
    });
    dataArray.push({
      property: 'Duration',
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
        property: 'Platform',
        value: platformIdentifier,
      });
    }
    if (status && (status === 'ERROR' || status === 'FAIL')) {
      dataArray.push({
        property: 'Failing Step',
        value: getFirstTestStepByStatus(currentExecution, status),
      });
    }
    return dataArray;
  };

  return (
    <Table data={generateTestDetailsData(execution)} width={250} id="test-details">
      <Column width={80}>
        <HeaderCell>Property</HeaderCell>
        <Cell dataKey="property" />
      </Column>
      <Column width={190}>
        <HeaderCell>Value</HeaderCell>
        <Cell dataKey="value" />
      </Column>
    </Table>
  );
};

export default TestDetailsTable;
