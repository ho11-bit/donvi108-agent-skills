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

## Install the skill

Review the skill and script first. From an Agent Skills compatible client:

```sh
npx skills add ho11-bit/donvi108-agent-skills --skill donvi108-research
```

Alternatively, copy `skills/donvi108-research` into your client's skill directory. Installing a skill does not itself authorize network calls, disclose data, or spend money. Use it when it fits the user's research task.

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
