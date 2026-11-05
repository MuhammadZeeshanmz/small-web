import 'reflect-metadata';
import { connect, disconnect, model } from 'mongoose';
import { Site, SiteSchema } from './schemas/site.schema';
import { Person, PersonSchema } from './schemas/person.schema';
import { Visit, VisitSchema } from './schemas/visit.schema';
import { isAddress, normalizeAddress } from './lib/address';
import { sanitizeSiteHtml, toBodyText } from './lib/sanitize';
import { PEOPLE, SITES } from './seed-data';

// Same seed gives the same numbers, so the walk can be walked again.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE = Date.UTC(2026, 10, 1, 9, 0, 0); // fixed start time, not "now"
const PLAN = [
  { name: 'Amina', steps: 18, seed: 1 },
  { name: 'Bilal', steps: 14, seed: 2 },
  { name: 'Chen', steps: 22, seed: 3 },
  { name: 'Dara', steps: 16, seed: 4 },
  { name: 'Eli', steps: 70, seed: 5 }, // has been nearly everywhere
];

function linksOf(html: string): string[] {
  const found = [...html.matchAll(/href="([^"]+)"/g)].map((m) => normalizeAddress(m[1]));
  return [...new Set(found.filter(isAddress))];
}

function buildVisits() {
  const graph = new Map(SITES.map((s) => [s.address, linksOf(s.html)]));
  const real = new Set(graph.keys());
  const all = [...real];
  const visits: { person: string; address: string; at: Date; via: string; status: string }[] = [];

  PLAN.forEach((p, pi) => {
    const rand = rng(p.seed);
    const pick = <T>(a: T[]) => a[Math.floor(rand() * a.length)];
    let current = 'index.zz';
    let previous: string | null = null;
    let via = 'typed';

    for (let i = 0; i < p.steps; i++) {
      visits.push({
        person: p.name,
        address: current,
        via,
        status: real.has(current) ? 'shown' : 'nowhere',
        at: new Date(BASE + pi * 5 * 60_000 + Math.round((i * 3_600_000) / p.steps)),
      });
      const links = graph.get(current) ?? [];
      const r = rand();
      const before = current;
      if (r < 0.7 && links.length) {
        current = pick(links);
        via = 'link';
      } else if (r < 0.85 && previous) {
        current = previous;
        via = 'back';
      } else {
        current = pick(all);
        via = 'typed';
      }
      previous = before;
    }
  });
  return visits;
}

async function main() {
  await connect(process.env.MONGO_URI ?? 'mongodb://localhost:27017/smallweb');
  const SiteModel = model(Site.name, SiteSchema);
  const PersonModel = model(Person.name, PersonSchema);
  const VisitModel = model(Visit.name, VisitSchema);
  await Promise.all([SiteModel.init(), PersonModel.init(), VisitModel.init()]);

  // Upsert by address and by name: running twice never doubles anything.
  await SiteModel.bulkWrite(
    SITES.map((s) => {
      const html = sanitizeSiteHtml(s.html);
      return {
        updateOne: {
          filter: { address: s.address },
          update: { $set: { title: s.title, author: s.author, html, bodyText: toBodyText(html) } },
          upsert: true,
        },
      };
    }),
  );
  await PersonModel.bulkWrite(
    PEOPLE.map((name) => ({
      updateOne: { filter: { name }, update: { $set: { name } }, upsert: true },
    })),
  );

  // History of the seeded people is rebuilt, so it is repeatable too.
  await VisitModel.deleteMany({ person: { $in: PEOPLE } });
  const visits = buildVisits();
  await VisitModel.insertMany(visits);

  console.log(`Seeded ${SITES.length} sites, ${PEOPLE.length} people, ${visits.length} visits.`);
  await disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});