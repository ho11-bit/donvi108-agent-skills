// Shared by the public page and the command-line example. No credentials or storage.
const origin = 'https://api.crossref.org/works/';

export function parseDoi(input) {
  let value = String(input ?? '').trim();
  const wrappers = { '<': '>', '[': ']', '(': ')', '"': '"' };
  if (wrappers[value[0]] && value.endsWith(wrappers[value[0]])) value = value.slice(1, -1).trim();
  value = value.replace(/^doi\s*:\s*/i, '');
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (!['doi.org', 'dx.doi.org'].includes(url.hostname) || url.username || url.password || url.port)
      throw new Error('invalid_doi');
    try { value = decodeURIComponent(url.pathname.slice(1)); } catch { throw new Error('invalid_doi'); }
  }
  if (!/^10\.\d{4,9}\/\S+$/iu.test(value) || /[\u0000-\u001f\u007f]/u.test(value) || value.length > 1024)
    throw new Error('invalid_doi');
  return value.toLowerCase();
}

function printable(text) {
  return String(text ?? '').replace(/<\/?(?:jats:)?(?:i|b|em|strong|sub|sup|italic|bold|scp)>/gi, '')
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g, entity => ({
      '&amp;':'&', '&lt;':'<', '&gt;':'>', '&quot;':'"', '&apos;':"'", '&#39;':"'", '&nbsp;':' '
    })[entity]).trim();
}

export function comparableTitle(text) {
  return printable(text).normalize('NFC').toLowerCase().replace(/[\u2010\u2011]/g, '-')
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/gu, ' ').trim().replace(/\.$/, '');
}

async function request(doi, suffix, accept, fetcher) {
  const path = doi.split('/').map(encodeURIComponent).join('/');
  const response = await fetcher(origin + path + suffix, {
    credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: accept },
    signal: AbortSignal.timeout(18000)
  });
  if (!response.ok) throw new Error(response.status === 404 ? 'not_in_crossref'
    : response.status === 429 ? 'rate_limited' : 'source_unavailable');
  return response;
}

export async function verifyReference(input, expectedTitle = '', fetcher = fetch) {
  const doi = parseDoi(input);
  const response = await request(doi, '', 'application/json', fetcher);
  const record = (await response.json()).message;
  if (String(record?.DOI || '').toLowerCase() !== doi) throw new Error('invalid_response');
  const titles = (record.title || []).map(printable).filter(Boolean);
  const subtitles = (record.subtitle || []).map(printable).filter(Boolean);
  const possible = titles.flatMap(title => [title, ...subtitles.map(s => title + ': ' + s)]);
  const authors = (record.author || []).map(a => a.name || [a.given, a.family, a.suffix].filter(Boolean).join(' ')).filter(Boolean);
  const year = key => record[key]?.['date-parts']?.[0]?.[0] || null;
  const years = { online: year('published-online'), print: year('published-print'), issued: year('issued') };
  const venue = printable(record['container-title']?.[0]);
  const missing = [!titles.length && 'title', !authors.length && 'authors', !venue && 'venue',
    !Object.values(years).some(Boolean) && 'year'].filter(Boolean);
  const expected = comparableTitle(expectedTitle);
  const comparison = !expected ? 'no_title_supplied' : !titles.length ? 'needs_review'
    : possible.some(t => comparableTitle(t) === expected) ? 'title_matches' : 'title_differs';
  return { doi, title: titles[0] || '', subtitles, authors, venue, years, comparison, missing,
    url: 'https://doi.org/' + doi.split('/').map(encodeURIComponent).join('/') };
}

export async function downloadBibtex(input, fetcher = fetch) {
  const doi = parseDoi(input);
  const response = await request(doi, '/transform/application/x-bibtex', 'application/x-bibtex', fetcher);
  const bib = (await response.text()).trim();
  if (!/^@[a-z]+\s*[{(]/i.test(bib)) throw new Error('invalid_response');
  return bib + '\n';
}
