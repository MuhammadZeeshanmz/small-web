import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site } from '../schemas/site.schema';
import { Person } from '../schemas/person.schema';
import { STATUS, VIA, Visit } from '../schemas/visit.schema';
import { isAddress, normalizeAddress } from '../lib/address';
import { sanitizeSiteHtml, toBodyText } from '../lib/sanitize';

function snippet(text: string, words: string[]): string {
  const lower = text.toLowerCase();
  const hits = words.map((w) => lower.indexOf(w)).filter((i) => i >= 0);
  const at = hits.length ? Math.min(...hits) : 0;
  const start = Math.max(0, at - 60);
  const piece = text.slice(start, start + 180);
  return (start > 0 ? '…' : '') + piece + (start + 180 < text.length ? '…' : '');
}

@Injectable()
export class WebService {
  constructor(
    @InjectModel(Site.name) private sites: Model<Site>,
    @InjectModel(Person.name) private people_: Model<Person>,
    @InjectModel(Visit.name) private visits: Model<Visit>,
  ) {}

  async people() {
    const all = await this.people_.find().sort({ name: 1 }).lean();
    return all.map((p) => p.name);
  }

  async site(raw: string) {
    const address = normalizeAddress(raw);
    const s = await this.sites
      .findOne({ address })
      .select('address title html author updatedAt')
      .lean();
    if (!s) throw new NotFoundException({ address, message: 'No such address' });
    return s;
  }

  async search(q: string) {
    const query = (q ?? '').trim();
    if (!query) return [];
    const docs = await this.sites
      .find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' }, address: 1, title: 1, author: 1, bodyText: 1 },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return docs.map((d) => ({
      address: d.address,
      title: d.title,
      author: d.author,
      snippet: snippet(d.bodyText, words),
    }));
  }

  async publish(b: { address: string; title: string; html: string; author: string }) {
    const address = normalizeAddress(b?.address ?? '');
    if (!isAddress(address)) throw new BadRequestException('Address must look like name.zz');
    const title = (b.title ?? '').trim();
    if (!title) throw new BadRequestException('Title is required');
    if (!(b.html ?? '').trim()) throw new BadRequestException('Page is empty');
    if (b.html.length > 100_000) throw new BadRequestException('Page is too large');
    if (!(await this.people_.exists({ name: b.author })))
      throw new BadRequestException('Unknown author');

    const html = sanitizeSiteHtml(b.html);
    try {
      await this.sites.create({
        address,
        title,
        html,
        bodyText: toBodyText(html),
        author: b.author,
      });
    } catch (e) {
      if ((e as { code?: number }).code === 11000)
        throw new ConflictException('That address is already taken');
      throw e;
    }
    return { address };
  }

  async visit(b: { person: string; address: string; via: string; status: string }) {
    if (!(await this.people_.exists({ name: b?.person })))
      throw new BadRequestException('Unknown person');
    if (!(VIA as readonly string[]).includes(b.via)) throw new BadRequestException('Bad via');
    if (!(STATUS as readonly string[]).includes(b.status))
      throw new BadRequestException('Bad status');
    const address = normalizeAddress(String(b.address ?? '')).slice(0, 200);
    if (!address) throw new BadRequestException('Address is required');
    await this.visits.create({
      person: b.person,
      address,
      at: new Date(),
      via: b.via,
      status: b.status,
    });
    return { ok: true };
  }

  async history(person: string) {
    const rows = await this.visits.find({ person }).sort({ at: -1 }).limit(500).lean();
    const addresses = [...new Set(rows.map((r) => r.address))];
    const found = await this.sites
      .find({ address: { $in: addresses } })
      .select('address title')
      .lean();
    const titles = new Map(found.map((s) => [s.address, s.title]));
    return rows.map((r) => ({
      address: r.address,
      title: titles.get(r.address) ?? null,
      at: r.at,
      via: r.via,
      status: r.status,
    }));
  }
}