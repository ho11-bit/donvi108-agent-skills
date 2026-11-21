"""Exercise a real MCP adapter with one public query. No model call is made."""
import argparse
import asyncio
import json
import time
from importlib.metadata import version

URL = "https://donvi108-agent-hub-live-preview.donvi108.workers.dev/mcp"
DEFAULT_QUERY = "phân bố xác suất hệ số khuếch tán clorua trong bê tông cốt liệu tái chế"


class SourceUnavailable(RuntimeError):
    pass


def result_items(response):
    # Both adapters expose MCP text blocks. Some versions unwrap a single block.
    if isinstance(response, str):
        return result_items(json.loads(response))
    if isinstance(response, list):
        for block in response:
            if getattr(block, "type", None) == "text":
                return result_items(block.text)
            if isinstance(block, str) or isinstance(block, dict) and "text" in block:
                return result_items(block)
    if isinstance(response, dict):
        if response.get("error"):
            error = response["error"]
            if isinstance(error, dict):
                if error.get("code") == "RESEARCH_SOURCE_UNAVAILABLE":
                    raise SourceUnavailable("Crossref did not return usable metadata")
                raise RuntimeError(f'{error.get("code")}: {error.get("message")}')
            raise RuntimeError(str(error))
        if "data" in response:
            return response["data"]["items"]
        if "text" in response:
            return result_items(response["text"])
    keys = sorted(response) if isinstance(response, dict) else []
    raise ValueError(f"Unexpected tool response type {type(response).__name__}, fields {keys}")


def smolagents_search(arguments):
    from smolagents import MCPClient

    with MCPClient({"url": URL, "transport": "streamable-http"}, structured_output=False) as tools:
        search = next(tool for tool in tools if tool.name == "research_papers")
        return search(**arguments)


async def gpt_researcher_search(arguments):
    from gpt_researcher.mcp.client import MCPClientManager

    manager = MCPClientManager([{"name": "donvi108", "connection_url": URL}])
    try:
        tools = await manager.get_all_tools()
        search = next(tool for tool in tools if tool.name == "research_papers")
        return await search.ainvoke(arguments)
    finally:
        await manager.close_client()


async def langchain_search(arguments):
    from langchain_mcp_adapters.client import MultiServerMCPClient

    client = MultiServerMCPClient({"donvi108": {"url": URL, "transport": "streamable_http"}})
    tools = await client.get_tools()
    search = next(tool for tool in tools if tool.name == "research_papers")
    return await search.ainvoke(arguments)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("adapter", choices=["smolagents", "langchain", "gpt-researcher"])
    parser.add_argument("query", nargs="?", default=DEFAULT_QUERY)
    parser.add_argument("--qa", action="store_true", help="Label maintainer/CI traffic as internal QA")
    args = parser.parse_args()
    arguments = {"query": args.query, "limit": 5, "source": "internal-qa" if args.qa else "github"}
    package = {"smolagents": "smolagents", "langchain": "langchain-mcp-adapters",
               "gpt-researcher": "gpt-researcher"}[args.adapter]
    for attempt in range(2):
        try:
            if args.adapter == "smolagents":
                response = smolagents_search(arguments)
            elif args.adapter == "gpt-researcher":
                response = asyncio.run(gpt_researcher_search(arguments))
            else:
                response = asyncio.run(langchain_search(arguments))
            items = result_items(response)
            break
        except SourceUnavailable:
            if attempt or not args.qa:
                raise
            print("Crossref unavailable. Retrying the QA query once in 20 seconds.", flush=True)
            time.sleep(20)
    print(f"{package} {version(package)}: {len(items)} candidates")
    for item in items:
        print(item["doi"], item["title"])
    if args.qa and not any(item["doi"].lower() == "10.1007/s40069-015-0123-6" for item in items):
        raise SystemExit("Expected reference missing from this internal QA query")
