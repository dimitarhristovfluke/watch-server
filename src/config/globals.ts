import * as env from "dotenv";

export const WCONNECT = () => {
  env.config();
  return process.env.WCONNECT_PATH;
};

export function DBFPATH(dbfName: string) {
  return WCONNECT() + dbfName;
}

export const config = {
  dateTimeFormat: "MM/DD/YYYY HH:mm:ss",
  port: 9999,
  serverZoneOffset: 60
};
