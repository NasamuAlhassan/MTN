import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Readable } from "node:stream";
import { khayaHandler, geminiHandler } from "./handlers.js";

function mockReq({ method = "GET", url = "/", headers = {}, body = "", ip = "1.2.3.4" } = {}) {
  const stream = Readable.from(body ? [Buffer.from(body)] : []);
  return Object.assign(stream, {
    method,
    url,
    headers: { "x-forwarded-for": ip, ...headers },
    socket: { remoteAddress: ip },
  });
}

function mockRes() {
  return {
    statusCode: 0,
    headers: {},
    body: undefined,
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    end(b) {
      this.body = b;
      this.ended = true;
    },
  };
}

function okFetch(payload = { languages: {} }) {
  return vi.fn(async () => ({
    status: 200,
    headers: { get: () => "application/json" },
    arrayBuffer: async () => Buffer.from(JSON.stringify(payload)),
  }));
}

describe("khayaHandler", () => {
  beforeEach(() => {
    process.env.KHAYA_API_KEY = "test-key";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.KHAYA_API_KEY;
  });

  it("returns 503 when no server key is configured", async () => {
    delete process.env.KHAYA_API_KEY;
    const res = mockRes();
    await khayaHandler(mockReq({ url: "/api/khaya/v1/languages", ip: "9.0.0.1" }), res);
    expect(res.statusCode).toBe(503);
  });

  it("injects the subscription key and proxies to the Khaya origin", async () => {
    const fetchMock = okFetch();
    vi.stubGlobal("fetch", fetchMock);
    const res = mockRes();
    await khayaHandler(mockReq({ url: "/api/khaya/v1/languages", ip: "9.0.0.2" }), res);
    expect(res.statusCode).toBe(200);
    const [calledUrl, opts] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("https://translation-api.ghananlp.org/v1/languages");
    expect(opts.headers["Ocp-Apim-Subscription-Key"]).toBe("test-key");
  });

  it("rate-limits a single IP after the window budget", async () => {
    vi.stubGlobal("fetch", okFetch());
    let last = 200;
    for (let i = 0; i < 60; i++) {
      const res = mockRes();
      await khayaHandler(mockReq({ url: "/api/khaya/v1/languages", ip: "5.5.5.5" }), res);
      last = res.statusCode;
    }
    expect(last).toBe(429);
  });
});

describe("geminiHandler", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GEMINI_API_KEY;
  });

  it("rejects non-POST methods", async () => {
    const res = mockRes();
    await geminiHandler(mockReq({ method: "GET", url: "/api/gemini", ip: "8.0.0.1" }), res);
    expect(res.statusCode).toBe(405);
  });

  it("rejects a malformed model id", async () => {
    const res = mockRes();
    await geminiHandler(
      mockReq({ method: "POST", url: "/api/gemini?model=../evil", body: "{}", ip: "8.0.0.2" }),
      res,
    );
    expect(res.statusCode).toBe(400);
  });

  it("forwards a valid request with the key kept server-side", async () => {
    const fetchMock = okFetch({ candidates: [] });
    vi.stubGlobal("fetch", fetchMock);
    const res = mockRes();
    await geminiHandler(
      mockReq({ method: "POST", url: "/api/gemini?model=gemini-2.0-flash", body: '{"contents":[]}', ip: "8.0.0.3" }),
      res,
    );
    expect(res.statusCode).toBe(200);
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain("gemini-2.0-flash:generateContent?key=test-key");
  });
});
