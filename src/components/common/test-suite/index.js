import React from 'react';
import SuiteTable from './SuiteTable';

const Page = function (props) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SuiteTable {...props} />
  );
};

export default Page;
