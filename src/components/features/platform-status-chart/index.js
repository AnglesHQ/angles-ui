import React from 'react';
import PlatformStatusBarChart from './PlatformStatusBarChart';

const Page = function (props) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PlatformStatusBarChart {...props} />
  );
};

export default Page;
