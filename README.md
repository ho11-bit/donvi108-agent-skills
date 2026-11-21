# DONVI108: free research tools for AI agents

Find candidate scholarly papers and DOI references from a REST or MCP workflow. **Public free beta: no invitation, no card, no wallet.** Search without an account, API key or Authorization header.

Source: Crossref public bibliographic metadata. Results are candidate references, not full text, private EIO retrieval, or verified scientific evidence. Check relevance and primary sources before citing. Do not send confidential queries.

- [Search papers and DOI in your browser](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/research)
- [MCP and REST quickstart](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/quickstart.md)
- [Live service](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/)
- [Free limits](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/v1/beta)
- [Measured usage](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/v1/beta/metrics)
- [Service status](https://donvi108-agent-status-live-preview.donvi108.workers.dev/)
- [Privacy](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/privacy.md)

[![DONVI108 on mcptry](https://mcptry.com/badge/io.github.ho11-bit/donvi108-research)](https://mcptry.com/servers/io.github.ho11-bit/donvi108-research)

[Worked example · Three SMA pullout studies (Vietnamese / English)](examples/sma-pullout.md)

## Check a reference in one minute

**Readers / Người đọc.** [Kiểm tra DOI và tải BibTeX](https://ho11-bit.github.io/donvi108-agent-skills/). Dán DOI và tiêu đề cần kiểm tra. Trang hiển thị tác giả theo thứ tự, ấn phẩm, năm online và năm in khi có. Chọn **Tải .bib cho Zotero**, sau đó **File → Import → A file**. [Tìm bài khi mới có từ khóa](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/research).

**Developers.** From this repository, use Python 3 for discovery or Node.js 22+ to resolve and export an exact Crossref DOI. No credentials or dependencies are required. The comparison is local. Crossref receives the DOI.

```sh
python examples/search.py "chloride diffusion recycled aggregate"
node examples/reference.mjs verify 10.1016/j.compstruct.2021.114254 "Your reference title"
node examples/reference.mjs bib 10.1016/j.compstruct.2021.114254 paper.bib
```

MCP clients that accept a remote HTTP server URL can use the following entry. The MCP server offers topic search. The web page and Node commands above handle exact matching and export.

```json
{"mcpServers":{"donvi108-research":{"url":"https://donvi108-agent-hub-live-preview.donvi108.workers.dev/mcp"}}}
```

[Try the two-minute pilot or send feedback](examples/pilot.md) · [Six additional civil-engineering checks](examples/benchmark.md)

[Watch the 48-second DOI and Zotero walkthrough](https://ho11-bit.github.io/donvi108-agent-skills/demo.mp4). The [five-record Zotero import](https://github.com/ho11-bit/donvi108-agent-skills/actions/runs/44861704836) checked real Crossref exports against Zotero translation-server for DOI, title, publication year and author order.

The [service metrics](https://donvi108-agent-hub-live-preview.donvi108.workers.dev/v1/beta/metrics) include anonymous keyword request totals per UTC day in `anonymous_daily`. Each row counts successful responses with items or an empty list, by caller-reported channel. Operator checks use `internal-qa`. Direct DOI lookups on this site go to Crossref and are outside these counts. Repeat users are assessed through voluntary pilot follow-up.

## Install the skill

Review the skill and script first. From an Agent Skills compatible client:

```sh
npx skills add ho11-bit/donvi108-agent-skills --skill donvi108-research
```

Alternatively, copy `skills/donvi108-research` into your client's skill directory. Installing a skill does not itself authorize network calls, disclose data, or spend money. Use it when it fits the user's research task.

From that directory, `node scripts/client.mjs verify DOI --title "Title to check"` compares a citation; `node scripts/client.mjs bib DOI --out paper.bib` saves a new file. Both commands work without registration.

## Try without an agent runtime

Node.js 22 or newer, no npm dependencies for this helper:

```sh
node skills/donvi108-research/scripts/client.mjs search "shape memory alloy fiber pullout concrete" --limit 3 --source github
```

An optional `register` command is available for feedback on authenticated searches. The helper saves those credentials privately under your home directory and does not print them. Re-running registration stops if the credential file exists. Keep that file out of source control. Set `DONVI108_BETA_CREDENTIAL_DIR` to use another private directory for a dedicated client. Registration profile fields are public. A lost registration response is not automatically retried.

## MCP

Streamable HTTP endpoint: `https://donvi108-agent-hub-live-preview.donvi108.workers.dev/mcp`.
Choose **None** for authentication and leave headers empty. Connect, list tools and call `research_papers` immediately. To send feedback on an authenticated search, use the same agent bearer for both calls.

- `research_papers`: `{ "query": "your public research topic", "limit": 3, "source": "mcp-registry" }`.
- `submit_beta_feedback`: `{ "call_id": "returned UUID", "useful": false, "category": "irrelevant", "comment": "Optional concrete feedback" }`.

Other existing network tools have their own scopes and availability. Private EIO is operator-controlled and is not part of this free research beta.

## Limits and feedback

20 search attempts/agent/UTC day; 60/shared IP/day; 500/day and 10/minute across the beta. Up to 5 references/request. Upstream failures can consume quota. Wait after 429 or 503; do not create identities to evade limits. No automatic paid upgrade.

After checking a result obtained with your own registered credential, optionally report its usefulness:

```sh
node skills/donvi108-research/scripts/client.mjs feedback RETURNED_CALL_ID --useful false --category irrelevant --comment "Explain the mismatch without private data"
```

Feedback is tied to your own completed search; repeating the call ID updates one report. Comments are private to the operator. Do not automatically send positive feedback, rate our internal tests as adoption, or post confidential data in issues.

Usage metrics distinguish **internal validation** from **unverified external agent identities**. Identity counts are not independent customers, and self-reported useful results are not purchases. Queries and result content are not persisted in beta analytics. Usage/feedback are cleaned up daily after 90 days; encrypted backups expire separately after seven days.

## What makes the beta useful?

Anonymous search, a bounded common REST/MCP interface, DOI-based references, explicit failure behavior, and feedback tied to actual results. Crossref is the underlying metadata provider and can also be used directly. This beta does not claim a proprietary corpus or superior search relevance.

Integration problems or suggestions: [open an issue](https://github.com/ho11-bit/donvi108-agent-skills/issues). Never include credentials or private queries. This repository contains only the public skill, client and documentation; the operational system is maintained separately.
