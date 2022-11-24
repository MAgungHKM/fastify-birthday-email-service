import fp from "fastify-plugin";
import { DateTime, HourNumbers } from "luxon";
import { zones } from "tzdata";

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

export interface ZonesPluginOptions {
  // Specify Zones plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<ZonesPluginOptions>(async (fastify, opts) => {
  fastify.decorate("getAllValidTimeZones", () => luxonValidTimeZones);

  fastify.decorate(
    "getAllTimeZonesByHour",
    (hour: HourNumbers, date: DateTime = DateTime.local()) => {
      const validTimeZones: Record<string, boolean> = {};

      for (const timeZone of luxonValidTimeZonesArr) {
        const zoneHour = date.setZone(timeZone).hour;

        if (zoneHour === hour) {
          console.log(timeZone, zoneHour, hour);
          validTimeZones[timeZone] = true;
        }
      }

      return validTimeZones;
    }
  );
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    getAllValidTimeZones(): Record<string, boolean>;
    getAllTimeZonesByHour(hour: HourNumbers): Record<string, boolean>;
  }
}
