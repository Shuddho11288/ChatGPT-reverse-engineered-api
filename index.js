const { ProxyAgent } = require("proxy-agent");
const { v4 } = require("uuid");
// Function to select a random proxy from the list
function getRandomProxy(proxyList) {
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[randomIndex];
}

// Function to fetch proxy list from the provided URL
async function fetchProxyList() {
  try {
    const response = await fetch(
      "https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=lastChecked&sort_type=desc"
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch proxy list (${response.status} ${response.statusText})`
      );
    }
    const data = await response.json();
    return data.data; // Assuming the proxy list is under 'data' key
  } catch (error) {
    console.error("Error fetching proxy list:", error.message);
    return []; // Return empty array if there's an error
  }
}

// Function to make a request using a proxy for GET method
async function getWithProxy(url) {
  const proxyList = await fetchProxyList();
  if (proxyList.length === 0) {
    console.log("Empty proxy list. Exiting.");
    return;
  }
  const randomProxy = getRandomProxy(proxyList);
  const protocol = randomProxy.protocols ? randomProxy.protocols[0] : "socks4"; // Access the first protocol from the array
  const proxyUrl = `${protocol || "socks4"}://${randomProxy.ip}:${
    randomProxy.port
  }`;
  try {
    const response = await fetch(url, {
      headers: {
        "Proxy-Connection": "keep-alive",
      },
      agent: new ProxyAgent(proxyUrl),
    });
    if (!response.ok) {
      throw new Error(
        `Request failed (${response.status} ${response.statusText})`
      );
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

// Function to make a request using a proxy for POST method
async function postWithProxy(url, data, headers) {
  const proxyList = await fetchProxyList();
  if (proxyList.length === 0) {
    console.log("Empty proxy list. Exiting.");
    return;
  }
  const randomProxy = getRandomProxy(proxyList);
  const protocol = randomProxy.protocols ? randomProxy.protocols[0] : "socks4"; // Access the first protocol from the array
  const proxyUrl = `${protocol || "socks4"}://${randomProxy.ip}:${
    randomProxy.port
  }`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Proxy-Connection": "keep-alive",
        ...headers,
      },
      body: JSON.stringify(data),
      agent: new ProxyAgent(proxyUrl),
    });
    if (!response.ok) {
      throw new Error(
        `Request failed (${response.status} ${response.statusText})`
      );
    }
    const responseData = await response.text();
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}
function generateRandomId(length = 6) {
  const id = Math.random()
    .toString(36)
    .substring(2, length + 2);
  console.log(`ID GENERATION: ${id}`);
  return id;
}

const main = () => {
  const url = "https://api.aichatos.cloud/api/generateStream";
  const data = {
    prompt: "lob uu",
    userId: "#/chat/"+Math.floor(Math.random()*10000000).toString(), // Your chatID for saved conversation and memory :)))
    network: true,
    system: "",
    withoutContext: false,
    stream: false,
  };

  const res = postWithProxy(url, data, {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8',
    'Dnt': '1',
    'Host': 'api.aichatos.cloud',
    'Origin': 'https://chat9.yqcloud.top',
    'Referer': 'https://chat9.yqcloud.top/',
    'Sec-Ch-Ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?1',
    'Sec-Ch-Ua-Platform': '"Android"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 Edg/124.0.0.0'
  });
  console.log(res);
};

main();
