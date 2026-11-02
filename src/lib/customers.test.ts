import { describe, expect, it } from 'vitest';
import type { Customer } from '../db/schema';
import { matchCustomers } from './customers';

const c = (id: string, name: string, phone: string): Customer => ({ id, name, phone, notes: '', createdAt: '' });
const all = [c('1', 'דנה לוי', '050-1234567'), c('2', 'מיכל כהן', '+972 52 765 4321'), c('3', 'Dana Cohen', '0541112233')];
const ids = (q: string) => matchCustomers(all, q).map((x) => x.id);

describe('matchCustomers', () => {
  it('returns everyone for an empty query', () => {
    expect(ids('  ')).toEqual(['1', '2', '3']);
  });

  it('matches part of a name, ignoring case', () => {
    expect(ids('כהן')).toEqual(['2']);
    expect(ids('dana')).toEqual(['3']);
  });

  it('matches digits whatever the punctuation', () => {
    expect(ids('0501')).toEqual(['1']);
    expect(ids('050-123')).toEqual(['1']);
    expect(ids('765 43')).toEqual(['2']);
  });

  it('matches 972 and 05x forms against each other', () => {
    expect(ids('052765')).toEqual(['2']);
    expect(ids('972501')).toEqual(['1']);
  });

  it('does not match on a single digit', () => {
    expect(ids('5')).toEqual([]);
  });
});
