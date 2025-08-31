import { GraphQLClient } from "graphql-request";

// Goldsky API endpoint for lending pool data
const GOLDSKY_API_ENDPOINT = "https://api.goldsky.com/api/public/project_cmds16kqrb8ra01wo4vdr7g5u/subgraphs/my-supgraph/1.1/gn";

export const graphClient = new GraphQLClient(GOLDSKY_API_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});
