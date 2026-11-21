# Try DONVI108 in a research agent

Use one public question about a paper you know. Write down its DOI before you search. Give the agent only the question and ask it to call `research_papers` with a limit of five. A different relevant paper is worth recording too. Check the original paper before deciding whether a sentence in a generated report is supported.

**Remote endpoint** `https://donvi108-agent-hub-live-preview.donvi108.workers.dev/mcp`. The public research tool accepts anonymous requests. Model-provider access for your own agent is separate. You can try the adapters below without running a model.

### GPT Researcher

Enable its MCP retriever using `RETRIEVER=mcp` in your environment, then pass the following list as `mcp_configs` to `GPTResearcher` in your usual research script. Use a question in your own domain. Inspect both the retrieval and the final report.

```json
[{"name":"donvi108","connection_url":"https://donvi108-agent-hub-live-preview.donvi108.workers.dev/mcp"}]
```

[GPT Researcher configuration](https://github.com/assafelovic/gpt-researcher/blob/main/docs/docs/gpt-researcher/retrievers/mcp-configs.mdx) · [Pilot discussion](https://github.com/assafelovic/gpt-researcher/discussions/2346)

### Hugging Face smolagents and LangChain Deep Agents

From this repository, pick the adapter you use. These commands list tools and make one bibliographic request through that adapter. For a full agent, supply the discovered research tool to your existing CodeAgent or research agent using your own model.

```sh
python -m pip install "smolagents[mcp]" "mcp>=1.15,<2"
python examples/agent-adapters.py smolagents
```

```sh
python -m pip install langchain-mcp-adapters
python examples/agent-adapters.py langchain "shrinkage in fly ash concrete"
```

The tested smolagents bridge uses the MCP 1.x SDK. Installing MCP 2.x with mcpadapt 0.1.20 fails during import, before it connects to a server.

[Hugging Face MCP documentation](https://huggingface.co/docs/smolagents/tutorials/tools) · [smolagents pilot discussion](https://github.com/huggingface/smolagents/discussions/3239) · [LangChain MCP documentation](https://docs.langchain.com/oss/python/langchain/mcp) · [Deep Agents research example](https://github.com/langchain-ai/deepagents/tree/main/examples/deep_research)

### What to report

- Agent or adapter and version, query language and the public question you tried.
- Tool call succeeded, failed, or was skipped. Include the error message after removing personal information.
- Expected DOI, returned title and DOI, rank 1–5, or “missing”. If you generated a report, check whether its cited source supports the claim.
- Vietnamese civil-engineering questions can use automatically matched English terms. Compare `verbatim: true` if a name, unit or search concept seems off.

Reply in the linked pilot discussion or [send feedback in the project](https://github.com/ho11-bit/donvi108-agent-skills/issues/new?template=reference-feedback.md). One difficult example is enough. The [benchmark](benchmark.md) reports operator tests separately from community participation.
