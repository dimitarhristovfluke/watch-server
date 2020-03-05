import Moment from "moment";
import * as R from "ramda";
import "moment-timezone";
import {
  ReadAutoX4ReportsDbf,
  ReadEmaintautoDbf,
  ReadX3AsyncWebRequestDbf,
  ReadAutoschedDbf,
  ReadX3PublishChannelEventsDbf,
  ReadEmaintautoLogDbf,
  ReadProcStatDbf
} from "./../../db";
import { EmaintAutoType } from "../../db/definitions";
import { config as G } from "../config/globals";
import { getAsyncStatus } from "../api/components/async/functions";
import { getAutorunStatus } from "../api/components/autorun/functions";

const isOlderThan = (date: Date, seconds: number) =>
  Moment(toCurrentTimeZone(date))
    .add(seconds, "s")
    .toDate()
    .valueOf() <
  Moment(Date.now())
    .toDate()
    .valueOf();

const isFutureDate = (date: Date) =>
  Moment(toCurrentTimeZone(date))
    .toDate()
    .valueOf() >
  Moment(Date.now())
    .toDate()
    .valueOf();

export const NOW = new Date();

export const isOneMinAgo = (date: Date) => !date || isOlderThan(date, 60);
export const isFiveMinAgo = (date: Date) => !date || isOlderThan(date, 300);
export const isPastDate = (date: Date) => !date || isOlderThan(date, 1);

type ReadTableFn = (
  startPos?: number,
  maxCount?: number
) => Promise<EmaintAutoType[]>;

export const getAutorunStat = async (readTableFn: ReadTableFn) => {
  const allAutos = await readTableFn(0, 100000);
  const logs = await ReadEmaintautoLogDbf(-1000, 1000);
  const procs = await ReadProcStatDbf();

  const addObj = {
    LASTCHECK: allAutos.reduce(
      (max, p) => (p.DLASTRUN > max ? p.DLASTRUN : max),
      new Date(1900, 0, 0)
    ),
    COUNT: allAutos.length
  };

  const autorunStat = R.countBy(r => {
    return getAutorunStatus(r, logs, procs);
  }, allAutos);

  return Object.assign({}, addObj, autorunStat);
};

export const getAsyncStat = async () => {
  const allAsync = (await ReadX3AsyncWebRequestDbf(-1000, 1000)).filter(r =>
    isToday(r.SUBMITTED)
  );

  const addObj = {
    LASTCHECK: allAsync.reduce(
      (max, p) => (p.COMPLETED > max ? p.COMPLETED : max),
      new Date(1900, 0, 0)
    ),
    COUNT: allAsync.length
  };

  const asyncStat = R.countBy(r => {
    return getAsyncStatus(r);
  }, allAsync);

  return Object.assign({}, addObj, asyncStat);
};

export const getPubSubStat = async () => {
  const allPubsub = (
    await ReadX3PublishChannelEventsDbf(-1000, 1000)
  ).filter(r => isToday(r.SUBMITTED));

  const addObj = {
    LASTCHECK: allPubsub.reduce(
      (max, p) => (p.COMPLETED > max ? p.COMPLETED : max),
      new Date(1900, 0, 0)
    ),
    COUNT: allPubsub.length
  };

  const pubsubStat = R.countBy(r => {
    return getAsyncStatus(r);
  }, allPubsub);

  return Object.assign({}, addObj, pubsubStat);
};

export const clientZoneOffset = Moment.parseZone(new Date()).utcOffset();
export const toCurrentTimeZone = (date: Date) =>
  Moment(date).add(-G.serverZoneOffset + clientZoneOffset, "minutes");

export const properCase = function(s: string) {
  return s.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  );
};
