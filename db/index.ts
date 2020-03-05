import { DBFPATH } from "../src/config/globals";
import { Read, Append } from "./dataaccess";
import {
  ProcStatType,
  EmaintAutoType,
  AsyncType,
  ProcDefType,
  EmaintAutoLogType
} from "./definitions";

const dbfFile = DBFPATH("procstat.dbf");

// ProcMon.exe
export const ReadProcdefDbf = Read<ProcDefType>(DBFPATH("procdef.dbf"));
export const ReadProcStatDbf = Read<ProcStatType>(DBFPATH("procstat.dbf"));

export const AppendProcdefDbf = Append(DBFPATH("procdef.dbf"));
export const AppendProcstatDbf = Append(DBFPATH("procstat.dbf"));

// Autorun.exe
export const ReadEmaintautoDbf = Read<EmaintAutoType>(
  DBFPATH("emaintauto.dbf")
);
export const ReadAutoschedDbf = Read<EmaintAutoType>(DBFPATH("autosched.dbf"));
export const ReadAutoX4ReportsDbf = Read<EmaintAutoType>(
  DBFPATH("autox4reports.dbf")
);

export const ReadBackupsDbf = Read<EmaintAutoType>(DBFPATH("backups.dbf"));

export const ReadEmaintautoLogDbf = Read<EmaintAutoLogType>(
  DBFPATH("emaintautolog.dbf")
);

export const AppendEmaintautoDbf = Append(DBFPATH("emaintauto.dbf"));
export const AppendAutoschedDbf = Append(DBFPATH("autosched.dbf"));
export const AppendAutoX4ReportsDbf = Append(DBFPATH("autox4reports.dbf"));

// Async
export const ReadX3AsyncWebRequestDbf = Read<AsyncType>(
  DBFPATH("x3asyncwebrequest.dbf")
);

export const AppendX3AsyncWebRequestDbf = Append(
  DBFPATH("x3asyncwebrequest.dbf")
);

// Pc Handler
export const ReadX3PublishChannelEventsDbf = Read<AsyncType>(
  DBFPATH("x3PublishChannelEvents.dbf")
);

export const AppendX3PublishChannelEventsDbf = Append(
  DBFPATH("x3PublishChannelEvents.dbf")
);
