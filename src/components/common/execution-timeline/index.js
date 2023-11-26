import React from 'react';
import StepsTimeline from './StepsTimeline';

const Page = function (props) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StepsTimeline {...props} />
  );
};

export default Page;
