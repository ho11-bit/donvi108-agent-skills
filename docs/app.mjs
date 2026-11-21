import { verifyReference, downloadBibtex } from './reference.mjs';
const el = id => document.getElementById(id);
const messages = {
  invalid_doi: 'Hãy dán một DOI bắt đầu bằng 10. hoặc một URL doi.org.',
  not_in_crossref: 'Crossref chưa có bản ghi hoặc định dạng được yêu cầu cho DOI này. Kiểm tra DOI ở nhà xuất bản.',
  rate_limited: 'Crossref đang giới hạn số yêu cầu. Hãy thử lại sau.',
  invalid_response: 'Dữ liệu trả về chưa đủ để xác nhận DOI này.'
};
const comparisons = {
  no_title_supplied: 'Đã tìm thấy DOI. Chưa nhập tiêu đề để đối chiếu.',
  title_matches: 'Tiêu đề khớp với bản ghi Crossref.',
  title_differs: 'Tiêu đề khác bản ghi Crossref. Hãy đối chiếu bài gốc trước khi trích dẫn.',
  needs_review: 'Crossref thiếu tiêu đề để đối chiếu.'
};
const fieldNames = {title:'tiêu đề', authors:'tác giả', venue:'tạp chí hoặc ấn phẩm', year:'năm'};
const errorText = error => messages[error.message] || 'Chưa kết nối được với Crossref hoặc nguồn đang bận. Vui lòng thử lại sau.';
let current;
let generation = 0;
function reset() {
  generation += 1;
  current = null;
  el('result').hidden = true;
  el('status').textContent = '';
  el('bib-status').textContent = '';
  el('submit').disabled = false;
  el('bib').disabled = false;
}
el('lookup').addEventListener('input', reset);
el('example').addEventListener('click', () => {
  reset();
  el('doi').value = '10.1016/j.compstruct.2021.114254';
  el('expected').value = '';
  el('submit').focus();
});
el('lookup').addEventListener('submit', async event => {
  event.preventDefault();
  reset();
  const version = generation;
  el('submit').disabled = true;
  el('status').textContent = 'Đang tra cứu…';
  try {
    const item = await verifyReference(el('doi').value, el('expected').value);
    if (version !== generation) return;
    current = item;
    el('paper').textContent = [item.title, ...item.subtitles].filter(Boolean).join(': ') || item.doi;
    el('comparison').textContent = comparisons[item.comparison];
    el('metadata').replaceChildren();
    for (const [key, value] of [['DOI',item.doi],['Tác giả',item.authors.join(', ')],['Ấn phẩm',item.venue],
      ['Năm trực tuyến',item.years.online],['Năm bản in',item.years.print],['Năm phát hành (issued)',item.years.issued]]) {
      if (!value) continue;
      const label = document.createElement('dt'), detail = document.createElement('dd');
      label.textContent = key; detail.textContent = value; el('metadata').append(label,detail);
    }
    el('missing').textContent = item.missing.length ? 'Bản ghi còn thiếu ' + item.missing.map(k => fieldNames[k]).join(', ') + '.' : '';
    el('article').href = item.url;
    el('result').hidden = false;
    el('status').textContent = comparisons[item.comparison];
  } catch (error) { if (version === generation) el('status').textContent = errorText(error); }
  finally { if (version === generation) el('submit').disabled = false; }
});
el('bib').addEventListener('click', async () => {
  const item = current;
  if (!item) return;
  el('bib').disabled = true;
  try {
    const contents = await downloadBibtex(item.doi);
    if (current !== item) return;
    const url = URL.createObjectURL(new Blob([contents], {type:'application/x-bibtex;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = item.doi.replace(/[^a-z0-9.-]+/gi,'_') + '.bib';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    el('bib-status').textContent = 'Đã tạo tệp .bib. Trong Zotero, chọn File → Import → A file.';
  } catch (error) { if (current === item) el('bib-status').textContent = errorText(error); }
  finally { if (current === item) el('bib').disabled = false; }
});
