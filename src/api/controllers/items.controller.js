import { Item } from '../../domain/models/Item.js';
import { ListItemsQuery } from '../validators/items.validators.js';

export async function listItems(req, res) {
  const q = ListItemsQuery.parse(req.query);
  const filter = {};
  if (q.sector) filter.sector = q.sector;
  if (q.source) filter.source = q.source;
  if (q.minScore !== undefined) filter.score = { $gte: q.minScore };
  if (q.from || q.to) {
    filter.publishedAt = {};
    if (q.from) filter.publishedAt.$gte = new Date(q.from);
    if (q.to) filter.publishedAt.$lte = new Date(q.to);
  }
  if (q.q) {
    filter.$or = [
      { title:   { $regex: q.q, $options: 'i' } },
      { summary: { $regex: q.q, $options: 'i' } },
      { company: { $regex: q.q, $options: 'i' } }
    ];
  }

  const page = q.page || 1;
  const limit = q.limit || 20;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Item.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit),
    Item.countDocuments(filter)
  ]);

  res.json({ page, limit, total, items });
}
