require("dotenv").config();
const {
  RestClient,
  CollectionNameRequest,
  TokenSwapsRequest,
  NftSocialRequest,
} = require("@hellomoon/api");
const { paginateUntilEmpty } = require("../util/paginationToken.js");

// get this from the .env file
const helloMoonClient = new RestClient(process.env.HELLOMOON_API_KEY);

const main = async () => {
  // set query body parameters for defi/swaps
  const limit = 2;
  const blockTime = {
    operator: "between",
    greaterThan: 1679186590,
    lessThan: 1679272930,
  };
  const userAccount = "FBNGk734Te2KECh8ZFv9PMHTF5nC98BsAtEncee44SFB";

  // https://docs.hellomoon.io/reference/post_v0-defi-swaps
  const defiSwapsPromise = async (paginationToken) => {
    if (paginationToken) {
      return await helloMoonClient.send(
        new TokenSwapsRequest({
          userAccount,
          blockTime,
          limit,
          paginationToken,
        })
      );
    } else {
      return await helloMoonClient.send(
        new TokenSwapsRequest({ userAccount, blockTime, limit })
      );
    }
  };

  // pagination occurs here. Make sure the request is under 360 requests / minute
  // or else you might be rate limited
  const allDefiSwaps = await paginateUntilEmpty(defiSwapsPromise);

  console.log({ allDefiSwaps });
};

main().then().catch();
