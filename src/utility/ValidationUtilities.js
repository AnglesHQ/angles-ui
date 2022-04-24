export const checkValidityOfIdsQueryString = (idsString, objectArray) => {
  const validIds = [];
  if (idsString && objectArray) {
    const idArray = idsString.split(',');
    idArray.forEach((filteredId) => {
      const itemFound = objectArray.find((item) => item._id === filteredId);
      if (itemFound) {
        validIds.push({ value: filteredId, label: itemFound.name });
      }
    });
  }
  return validIds;
};

export const checkNothing = () => {
  // we don't do much
};
