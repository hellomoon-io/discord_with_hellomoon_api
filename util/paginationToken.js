module.exports = {
  paginateUntilEmpty: async (promise) => {
    let paginationToken = "";

    let response = await promise();
    let data = response.data;

    paginationToken = response.paginationToken
      ? response.paginationToken
      : undefined;

    while (paginationToken) {
      response = await promise(response.paginationToken);
      data = data.concat(response.data);

      paginationToken = response.paginationToken
        ? response.paginationToken
        : undefined;
    }
    return data;
  },
};
