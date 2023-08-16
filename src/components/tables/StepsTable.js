/* eslint react/no-array-index-key: [0] */
import React from 'react';
import Moment from 'react-moment';
import { useNavigate } from 'react-router-dom';
import { Table } from 'rsuite';

const {
  Column,
  HeaderCell,
  Cell,
  ColumnGroup,
} = Table;

const StepDateCell = function (props) {
  const { rowData: step } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {... props}>
      { step.timestamp ? (
        <div>
          <span>
            <Moment format="HH:mm:ss">
              {step.timestamp}
            </Moment>
          </span>
        </div>
      ) : 'N/A'}
    </Cell>
  );
};

const ScreenshotCell = function (props) {
  const {
    rowData: step,
    openModal,
    getScreenShot,
    ...rest
  } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Cell {...rest}>
      { step.screenshot ? (
        <div>
          <img
            src={`${getScreenShot(step.screenshot)}`}
            alt="Thumbnail"
            className="screenshot-thumbnail"
            onClick={() => openModal(step.screenshot)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      ) : ' - '}
    </Cell>
  );
};

const StepsTable = function (props) {
  const {
    index,
    action,
    openModal,
    screenshots,
  } = props;
  const getScreenShot = (screenshotId) => {
    if (screenshots !== undefined && screenshotId !== undefined) {
      const image = screenshots.filter((screenshot) => screenshot._id === screenshotId)[0];
      if (image !== undefined) {
        if (image.thumbnail.startsWith('data:image')) {
          // to handle move to jimp
          return image.thumbnail;
        }
        return `data:image/png;base64, ${image.thumbnail}`;
      }
    }
    return undefined;
  };

  // eslint-disable-next-line no-unused-vars
  const navigateToImageDetails = (imageId) => {
    const navigate = useNavigate();
    navigate(`/image/${imageId}`);
  };

  // const convertTextToLinks = (content) => {
  //   const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
  //   if (content) {
  //     return content.replace(reg, "<a href='$1$2' target='_blank'>$1$2</a>");
  //   }
  //   return '';
  // };

  return [
    <Table autoHeight width={800} headerHeight={80} data={action.steps} id="steps-table" key={`steps_table_${index}`}>
      <Column width={30}>
        <HeaderCell>#</HeaderCell>
        <Cell />
      </Column>
      <Column width={75}>
        <HeaderCell>Time</HeaderCell>
        <StepDateCell />
      </Column>
      <Column width={100}>
        <HeaderCell>Status</HeaderCell>
        <Cell dataKey="status" />
      </Column>
      <ColumnGroup header="Step Information">
        <Column width={200} colSpan={4}>
          <HeaderCell>Info</HeaderCell>
          <Cell dataKey="info" />
        </Column>
        <Column width={100}>
          <HeaderCell>Step</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={100}>
          <HeaderCell>Expected</HeaderCell>
          <Cell dataKey="expected" />
        </Column>
        <Column width={100}>
          <HeaderCell>Actual</HeaderCell>
          <Cell dataKey="actual" />
        </Column>
      </ColumnGroup>
      <Column width={350}>
        <HeaderCell>Screenshot</HeaderCell>
        <ScreenshotCell openModal={openModal} getScreenShot={getScreenShot} />
      </Column>
    </Table>,
  ];
};

export default StepsTable;
