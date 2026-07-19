import React from 'react';
import ExecutionsResultsBar from './ExecutionsResultsBar';

const Page = function (props) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ExecutionsResultsBar {...props} />
  );
};

export default Page;
