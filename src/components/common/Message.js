import React from 'react';
import { Notification } from 'rsuite';

const Message = function (props) {
  const {
    ref,
    type,
    message,
  } = props;
  return (
    <Notification ref={ref} type={type} header={type}>
      <div>
        <span>{message}</span>
      </div>
    </Notification>
  );
};

export default Message;
