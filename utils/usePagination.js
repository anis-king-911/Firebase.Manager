function usePagination(array, pageIndex = 1, itemsPerPage = 10, pagesPerSet = 5) {
  if (!Array.isArray(array)) {
    throw new Error('The "array" parameter must be an array.');
  }
  if (array.length === 0) {
    throw new Error('The array can not be empty.');
  }
  if (typeof pageIndex !== 'number' || pageIndex < 1 || pageIndex > Math.ceil(array.length / itemsPerPage)) {
    throw new Error('The "pageIndex" parameter must be a number between 1 and the calculated total pages.');
  }
  if (typeof itemsPerPage !== 'number' || itemsPerPage < 1) {
    throw new Error('The "itemsPerPage" parameter must be a positive number.');
  }
  if (typeof pagesPerSet !== 'number' || pagesPerSet < 1) {
    throw new Error('The "pagesPerSet" parameter must be a positive number.');
  }

  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const totalSets = Math.ceil(totalPages / pagesPerSet);

  const paginatedData = [];
  for (let i = 0; i < totalPages; i++) {
    paginatedData.push({
      data: array.slice(i * itemsPerPage, (i + 1) * itemsPerPage),
      page: i + 1,
      from: i * itemsPerPage,
      to: Math.min((i + 1) * itemsPerPage, totalItems)
    });
  }

  const pageSets = [];
  for (let i = 0; i < totalSets; i++) {
    pageSets.push({
      from: i * pagesPerSet + 1,
      to: Math.min((i + 1) * pagesPerSet, totalPages)
    });
  }

  const selectedSet = pageSets.find(set => pageIndex >= set.from && pageIndex <= set.to);
  const selectedPages = paginatedData.filter(page => page.page >= selectedSet.from && page.page <= selectedSet.to);
  const dataToShow = paginatedData.find(page => page.page === pageIndex);

  const btnsToShow = Array.from({ length: totalPages }, (_, i) => i + 1).slice(selectedSet.from - 1, selectedSet.to);

  return {
    btnsToShow,
    data: dataToShow ? dataToShow.data : [],
    pageInfo: {
      page: pageIndex,
      from: dataToShow ? dataToShow.from : 0,
      to: dataToShow ? dataToShow.to : 0,
      TotalPages: totalPages,
      TotalItems: totalItems,
    },
    availability: {
      previous: pageIndex <= 1,
      next: pageIndex >= totalPages,
      previousGroup: selectedSet.from > 1,
      nextGroup: selectedSet.to < totalPages
    }
  };
}

export default usePagination;