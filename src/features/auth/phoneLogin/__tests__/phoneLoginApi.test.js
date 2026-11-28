import axios from "axios";
import { fetchPhoneLoginCountries, phoneLoginStart, phoneLoginVerify } from "../phoneLoginApi";

jest.mock("axios");

describe("phoneLoginApi", () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
  });

  it("loads and normalizes countries", async () => {
    axios.get.mockResolvedValue({ data: { countries: ["us", "GB", "in", ""] } });
    await expect(fetchPhoneLoginCountries()).resolves.toEqual(["US", "GB", "IN"]);
    expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/phone\/countries$/));
  });

  it("posts login start with country hint", async () => {
    axios.post.mockResolvedValue({ data: { message: "ok" } });
    await phoneLoginStart("+15550100001", "US");
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/phone\/login\/start$/), {
      phone: "+15550100001",
      country: "US",
    });
  });

  it("posts login verify", async () => {
    axios.post.mockResolvedValue({ data: { token: "t" } });
    await phoneLoginVerify("+447700900123", "123456", "GB");
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/phone\/login\/verify$/), {
      phone: "+447700900123",
      code: "123456",
      country: "GB",
    });
  });
});