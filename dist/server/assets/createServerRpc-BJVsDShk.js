import { T as TSS_SERVER_FUNCTION } from "./server-BA6c70hh.js";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
export {
  createServerRpc as c
};
