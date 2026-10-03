import React from 'react';
import {
  MdOutlineArticle,
  MdDataObject,
  MdOutlineLan,
  MdOutlineVideocam,
  MdOutlineTimeline,
  MdOutlineFolderZip,
  MdOutlineWeb,
  MdOutlineImage,
  MdOutlineInsertDriveFile,
} from 'react-icons/md';

const KIND_ICONS = {
  log: MdOutlineArticle,
  json: MdDataObject,
  har: MdOutlineLan,
  video: MdOutlineVideocam,
  trace: MdOutlineTimeline,
  archive: MdOutlineFolderZip,
  html: MdOutlineWeb,
  image: MdOutlineImage,
};

// The icon for an attachment kind, coloured by its container.
const KindIcon = function ({ kind }) {
  const Icon = KIND_ICONS[kind] || MdOutlineInsertDriveFile;
  return <Icon className="test-attachment-kind-icon" aria-hidden="true" />;
};

export default KindIcon;
