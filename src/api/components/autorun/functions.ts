import {
  EmaintAutoType,
  EmaintAutoLogType,
  ProcDefType,
  ProcStatType
} from "../../../../db/definitions";
import { isPastDate } from "../../../common/functions";

const Now = new Date();

export const getAutorunStatus = (
  item: EmaintAutoType,
  log: EmaintAutoLogType[],
  procs: ProcStatType[]
) => {
  if (isPastDate(item.DNEXTRUN)) return "PENDING";

  const itemCmd = '"autorun.exe" ' + item.CCODE.substr(29);

  const process = procs.find(
    p =>
      p.CMDLINE.toLowerCase().indexOf("createprocess") === 0 &&
      itemCmd.indexOf(p.CMDLINE.substr(0, p.CMDLINE.length - 19)) >= 0
  );

  if (!!process) return "RUNNING";

  const lastRunLog = log.find(l => l.CRUNID === item.CRUNID);

  if (
    !lastRunLog ||
    lastRunLog.CERRORMSG.length === 0 ||
    lastRunLog.CERRORMSG.toUpperCase() === "SUCCESS"
  )
    return "SUCCESS";
  return "ERROR";
};
