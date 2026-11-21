"""Run: python examples/search.py "chloride diffusion recycled aggregate" """
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

query = " ".join(sys.argv[1:]).strip()
if not 3 <= len(query) <= 300:
    sys.exit('Supply a public search query of 3–300 characters.')
request = Request(
    "https://donvi108-agent-hub-live-preview.donvi108.workers.dev/v1/beta/research/search",
    data=json.dumps({"query":query,"limit":3,"source":"github"}).encode(),
    headers={"Content-Type":"application/json","User-Agent":"DONVI108-Research-Example/1.0"},
)
try:
    with urlopen(request, timeout=25) as response:
        items = json.load(response)["data"]["items"]
    print(json.dumps(items, ensure_ascii=False, indent=2))
except (HTTPError, URLError, TimeoutError) as exc:
    sys.exit(f"Search unavailable: {exc}")
