import * as R from "ramda";
import { ProcDefType } from "../../../../db/definitions";
import { isOneMinAgo } from "../../../common/functions";

export const serversList = (procdefList: ProcDefType[]) => {
  const procsByServer = R.groupBy(i => i.CSERVERID, procdefList);
  return R.keys(procsByServer);
};

export const isProcmonResponding = (procmon: ProcDefType) =>
  !isOneMinAgo(procmon.LASTCHECK);
