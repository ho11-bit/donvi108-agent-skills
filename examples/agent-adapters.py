"""Exercise a real MCP adapter with one public query. No model call is made."""
import argparse
import asyncio
import json
from importlib.metadata import version

URL = "https://donvi108-agent-hub-live-preview.donvi108.workers.dev/mcp"
DEFAULT_QUERY = "phân bố xác suất hệ số khuếch tán clorua trong bê tông cốt liệu tái chế"


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
        if "data" in response:
            return response["data"]["items"]
        if "text" in response:
            return result_items(response["text"])
    raise ValueError(f"Unexpected tool response type: {type(response).__name__}")


def smolagents_search(arguments):
    from smolagents import MCPClient

    with MCPClient({"url": URL, "transport": "streamable-http"}) as tools:
        search = next(tool for tool in tools if tool.name == "research_papers")
        return search(**arguments)


async def langchain_search(arguments):
    from langchain_mcp_adapters.client import MultiServerMCPClient

    client = MultiServerMCPClient({"donvi108": {"url": URL, "transport": "streamable_http"}})
    tools = await client.get_tools()
    search = next(tool for tool in tools if tool.name == "research_papers")
    return await search.ainvoke(arguments)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("adapter", choices=["smolagents", "langchain"])
    parser.add_argument("query", nargs="?", default=DEFAULT_QUERY)
    parser.add_argument("--qa", action="store_true", help="Label maintainer/CI traffic as internal QA")
    args = parser.parse_args()
    arguments = {"query": args.query, "limit": 5, "source": "internal-qa" if args.qa else "github"}
    if args.adapter == "smolagents":
        response = smolagents_search(arguments)
        package = "smolagents"
    else:
        response = asyncio.run(langchain_search(arguments))
        package = "langchain-mcp-adapters"
    items = result_items(response)
    print(f"{package} {version(package)}: {len(items)} candidates")
    for item in items:
        print(item["doi"], item["title"])
    if args.qa and not any(item["doi"].lower() == "10.1007/s40069-015-0123-6" for item in items):
        raise SystemExit("Expected reference missing from this internal QA query")
