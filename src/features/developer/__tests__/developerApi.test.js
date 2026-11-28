import { DEFAULT_BACKEND_API } from "@/config/backendApi";
import { API_KEY_SCOPES, MCP_TOOL_NAMES, mcpEndpointUrl } from "../developerApi";

describe("developerApi scopes and MCP URL", () => {
  test("API_KEY_SCOPES includes sites:write after sites:read", () => {
    const ids = API_KEY_SCOPES.map((scope) => scope.id);
    expect(ids).toContain("sites:write");
    expect(ids.indexOf("sites:write")).toBe(ids.indexOf("sites:read") + 1);
    const write = API_KEY_SCOPES.find((scope) => scope.id === "sites:write");
    expect(write.label).toMatch(/Edit sites/i);
    expect(write.label).toMatch(/drafts for owner approval/i);
  });

  test("MCP_TOOL_NAMES lists ten tools including sites:write component editors", () => {
    expect(MCP_TOOL_NAMES).toHaveLength(10);
    expect(MCP_TOOL_NAMES).toContain("add_site_component");
    expect(MCP_TOOL_NAMES).toContain("list_site_components");
  });

  test("default MCP endpoint uses the Railway production API host", () => {
    expect(mcpEndpointUrl()).toBe(`${DEFAULT_BACKEND_API}/api/mcp`);
    expect(mcpEndpointUrl()).toBe("https://backend-production-6b312c6c.up.railway.app/api/mcp");
  });
});