module.exports = {
  paginateUntilEmpty: async (promise) => {
    let counter = 0;
    let paginationToken = "";

    let response = await promise();
    let data = response.data;

    paginationToken = response.paginationToken
      ? response.paginationToken
      : undefined;

    while (paginationToken && counter < 20) {
      response = await promise(response.paginationToken);
      data = data.concat(response.data);

      paginationToken = response.paginationToken
        ? response.paginationToken
        : undefined;

      counter += 1;
    }
    return data;
  },
};
