import express = require("express");
import url = require("url");

const router = express.Router();
import {
  ReadProcdefDbf,
  ReadX3AsyncWebRequestDbf,
  ReadEmaintautoDbf,
  ReadAutoschedDbf,
  ReadEmaintautoLogDbf,
  ReadProcStatDbf,
  ReadX3PublishChannelEventsDbf,
  ReadAutoX4ReportsDbf,
  ReadBackupsDbf
} from "../db";
import { EmaintAutoType, AsyncType } from "../db/definitions";
import { getAutorunStatus } from "../src/api/components/autorun/functions";
import { getAsyncStatus } from "../src/api/components/async/functions";
import {
  serversList,
  isProcmonResponding
} from "../src/api/components/procdef/functions";
import {
  getAutorunStat,
  getAsyncStat,
  getPubSubStat,
  isToday
} from "../src/common/functions";
import { ProcessInfo } from "../src/common/types";

// url.parse(req.url,true).query returns { foo: 'bad', baz: 'foo' }.
// url.parse(req.url,true).host returns 'localhost:8080'.
// url.parse(req.url,true).pathname returns '/app.js'.
// url.parse(req.url,true).search returns '?foo=bad&baz=foo'.

// GET process definitions, with ability to search by server ID

router.get("/dashboard", async (req, res) => {
  try {
    // card - ProcMon status
    // card - Async status
    // card - EmaintAuto status
    // card - Autosched status
    // card - Backup Status
    // card - Reports status
    // card - Publish Channels status
    const cards: ProcessInfo[] = [];

    const procdefList = await ReadProcdefDbf(0, 1000);

    // ProcMon - check if running on all APP servers
    const appServers = serversList(procdefList);

    appServers.map(serverId => {
      const procmon = procdefList.find(
        p => p.PROCNAME === "PROCMON" && p.CSERVERID === serverId
      );

      const isResponding = isProcmonResponding(procmon);
      cards.push({
        PROCESSID: "PROCMON",
        PNAME: `Proc Mon`,
        PENDING: 0,
        ERRORS: isResponding ? 0 : 1,
        DETAILSURL: `/procmon/${serverId}`,
        CSERVERID: serverId.toString(),
        LASTCHECK: procmon.LASTCHECK
      });
    });

    // card - Report Scheduler
    const reportStats = await getAutorunStat(ReadAutoX4ReportsDbf);
    cards.push({
      PROCESSID: "AUTOX4REPORTS",
      PNAME: `Report Scheduler`,
      PENDING: reportStats.PENDING || 0,
      ERRORS: reportStats.ERROR || 0,
      COUNT: reportStats.COUNT,
      DETAILSURL: `/autorun/reports`,
      LASTCHECK: reportStats.LASTCHECK
    });

    // card - Auto Scheduler
    const schedulerStats = await getAutorunStat(ReadAutoschedDbf);
    cards.push({
      PROCESSID: "AUTOSCHED",
      PNAME: `Auto Scheduler`,
      PENDING: schedulerStats.PENDING || 0,
      ERRORS: schedulerStats.ERROR || 0,
      COUNT: schedulerStats.COUNT,
      DETAILSURL: `/autorun/autosched`,
      LASTCHECK: schedulerStats.LASTCHECK
    });

    // card - Clean up Tasks
    const emaintautoStats = await getAutorunStat(ReadEmaintautoDbf);
    cards.push({
      PROCESSID: "EMAINTAUTO",
      PNAME: `Clean up Tasks`,
      PENDING: emaintautoStats.PENDING || 0,
      ERRORS: emaintautoStats.ERROR || 0,
      COUNT: emaintautoStats.COUNT,
      DETAILSURL: `/autorun/emaintauto`,
      LASTCHECK: emaintautoStats.LASTCHECK
    });

    // card - Back up Tasks
    const backupStats = await getAutorunStat(ReadBackupsDbf);
    cards.push({
      PROCESSID: "BACKUP",
      PENDING: backupStats.PENDING || 0,
      ERRORS: backupStats.ERROR || 0,
      COUNT: backupStats.COUNT,
      PNAME: `Back up Tasks`,
      DETAILSURL: `/autorun/backup`,
      LASTCHECK: backupStats.LASTCHECK
    });

    // card - Async Tasks
    const asyncStats = await getAsyncStat();
    cards.push({
      PROCESSID: "ASYNC",
      PNAME: `Async Tasks`,
      PENDING: asyncStats.PENDING || 0,
      ERRORS: asyncStats.ERROR || 0,
      COUNT: asyncStats.COUNT,
      DETAILSURL: `/async/x3asyncwebrequest`,
      LASTCHECK: asyncStats.LASTCHECK
    });

    // card - Publish Channel Events
    const pubsubStats = await getPubSubStat();
    cards.push({
      PROCESSID: "PUBSUB",
      PNAME: `Pub/Sub Events`,
      PENDING: pubsubStats.PENDING || 0,
      ERRORS: pubsubStats.ERROR || 0,
      COUNT: pubsubStats.COUNT,
      DETAILSURL: `/async/x3publishchannelevents`,
      LASTCHECK: pubsubStats.LASTCHECK
    });

    res.status(200).json(cards);
  } catch (err) {
    res.status(400).json({
      message:
        "Some error occured - " + JSON.stringify(err) + ": " + err.message,
      err
    });
  }
});

router.get("/procmon", async (req, res) => {
  try {
    const recs = await ReadProcdefDbf(0, 1000);
    const serverId = url.parse(req.url, true).query["cserverid"];

    const output = !!serverId
      ? recs.filter(r => r.CSERVERID === serverId || r.CSERVERID.length == 0)
      : recs;

    res.status(200).json(output);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

router.get("/procmon/:id", async (req, res) => {
  try {
    const recs = await ReadProcdefDbf(0, 1000);
    const serverId = url.parse(req.url, true).query["cserverid"];

    const id = req.params.id;

    const recs2 = !!id ? recs.filter(r => r.PROCDEFID === id) : recs;

    const output = !!serverId
      ? recs2.filter(r => r.CSERVERID === serverId || r.CSERVERID.length == 0)
      : recs2;

    res.status(200).json(output);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

// GET all Processes running on all APP servers or selected APP server
router.get("/procstat", async (req, res) => {
  try {
    const recs = await ReadProcdefDbf(0, 1000);

    const serverId = url.parse(req.url, true).query["cserverid"];

    const output = !!serverId
      ? recs.filter(r => r.CSERVERID === serverId || r.CSERVERID.length == 0)
      : recs;

    res.status(200).json(output);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

// GET selected processes by ProdDefId
router.get("/procstat/:procdefid", async (req, res) => {
  try {
    const recs = await ReadProcdefDbf(0, 1000);

    const procdefid = req.params.procdefid;

    const output = !!procdefid
      ? recs.filter(r => r.PROCDEFID === procdefid)
      : recs;

    res.status(200).json(output);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

router.get("/async/:table", async (req, res) => {
  try {
    const table = req.params.table;
    let fn: (startPos?: number, maxCount?: number) => Promise<AsyncType[]>;
    switch (table.toLowerCase()) {
      case "x3asyncwebrequest":
        fn = ReadX3AsyncWebRequestDbf;
        break;
      case "x3publishchannelevents":
        fn = ReadX3PublishChannelEventsDbf;
        break;
      default:
        fn = ReadX3AsyncWebRequestDbf;
        break;
    }

    const recs = (await fn(-2000, 2000)).filter(r => isToday(r.SUBMITTED)); // up to last 2000 pubsub processes from today

    recs.map(r => (r.STATUS = getAsyncStatus(r)));

    res.status(200).json(recs);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

router.get("/async/:table/:id", async (req, res) => {
  try {
    const table = req.params.table;
    const id = req.params.id;
    let fn: (startPos?: number, maxCount?: number) => Promise<AsyncType[]>;
    switch (table.toLowerCase()) {
      case "x3asyncwebrequest":
        fn = ReadX3AsyncWebRequestDbf;
        break;
      case "x3publishchannelevents":
        fn = ReadX3PublishChannelEventsDbf;
        break;
      default:
        fn = ReadX3AsyncWebRequestDbf;
        break;
    }

    const recs = (await fn(-2000, 2000)).filter(r => isToday(r.SUBMITTED)); // up to last 2000 pubsub processes from today
    const output = recs.find(r => r.ID === id);
    output.STATUS = getAsyncStatus(output);

    res.status(200).json(output);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

router.get("/autorun/:table", async (req, res) => {
  try {
    const table = req.params.table;
    let fn: (startPos?: number, maxCount?: number) => Promise<EmaintAutoType[]>;
    switch (table.toLowerCase()) {
      case "autosched":
        fn = ReadAutoschedDbf;
        break;
      case "emaintauto":
        fn = ReadEmaintautoDbf;
        break;
      case "reports":
        fn = ReadAutoX4ReportsDbf;
        break;
      case "log":
        fn = ReadAutoX4ReportsDbf;
        break;
      default:
        fn = ReadAutoschedDbf;
        break;
    }
    const recs = await fn(0, 0);

    const logs = await ReadEmaintautoLogDbf(-1000, 1000);
    const procs = await ReadProcStatDbf();
    recs.map(r => (r.STATUS = getAutorunStatus(r, logs, procs)));

    res.status(200).json(recs);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

router.get("/autorun/:table/:id", async (req, res) => {
  try {
    const table = req.params.table;
    const id = req.params.id;
    let fn: (startPos?: number, maxCount?: number) => Promise<EmaintAutoType[]>;
    switch (table.toLowerCase()) {
      case "autosched":
        fn = ReadAutoschedDbf;
        break;
      case "emaintauto":
        fn = ReadEmaintautoDbf;
        break;
      case "reports":
        fn = ReadAutoX4ReportsDbf;
        break;
      default:
        fn = ReadAutoschedDbf;
        break;
    }
    const recs = await fn();

    const output = recs.find(r => r.CAUTOID === id);

    const logs = await ReadEmaintautoLogDbf(-1000, 1000);
    const procs = await ReadProcStatDbf();
    output.STATUS = getAutorunStatus(output, logs, procs);

    res.status(200).json(output);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

router.get("/emaintautolog", async (req, res) => {
  try {
    const logs = await ReadEmaintautoLogDbf(-1000, 1000);

    res.status(200).json(logs);
  } catch (err) {
    res.status(400).json({
      message: "Some error occured",
      err
    });
  }
});

export default router;
