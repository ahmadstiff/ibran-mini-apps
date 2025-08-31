import { gql } from "graphql-request";

export const queryLendingPool = () => {
  return gql`
    query MyQuery {
      lendingPoolCreateds {
        lendingPool
        id
        borrowToken
        collateralToken
        ltv
      }
    }
  `;
};
