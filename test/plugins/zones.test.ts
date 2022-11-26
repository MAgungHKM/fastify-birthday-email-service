import { test } from "tap";
import Fastify from "fastify";
import Zones from "../../src/plugins/zones";
import { DateTime } from "luxon";
import { zones } from "tzdata";

test("zones works standalone", async (t) => {
  const luxonValidTimeZonesArr = [
    ...new Set<string>(
      Object.keys(zones).filter(
        (tz) => tz.includes("/") && DateTime.local().setZone(tz).isValid
      )
    ),
  ].sort((a, b) => (a < b ? -1 : 1));

  const luxonValidTimeZones = luxonValidTimeZonesArr.reduce((obj, zone) => {
    obj[zone] = true;
    return obj;
  }, {} as Record<string, boolean>);

  const timeZonessByHour9: Record<string, string> = {};
  const date = DateTime.local();

  for (const timeZone of luxonValidTimeZonesArr) {
    const zoneHour = date.setZone(timeZone).hour;

    if (zoneHour === 9) {
      timeZonessByHour9[timeZone] = date.toFormat("yyyy-MM-dd");
    }
  }

  const fastify = Fastify();
  void fastify.register(Zones);
  await fastify.ready();

  t.same(fastify.getAllValidTimeZones(), luxonValidTimeZones);
  t.same(fastify.getAllTimeZonesByHour(9), timeZonessByHour9);
  t.same(fastify.getAllTimeZonesByHour(9, date), timeZonessByHour9);
});
