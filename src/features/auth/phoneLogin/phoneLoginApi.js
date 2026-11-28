import axios from "axios";
import { resolveBackendApi } from "@/config/backendApi";

const baseUrl = () => resolveBackendApi();

export async function fetchPhoneLoginCountries() {
  const res = await axios.get(`${baseUrl()}/api/auth/phone/countries`);
  const countries = Array.isArray(res.data?.countries) ? res.data.countries : [];
  return countries.map((c) => String(c).toUpperCase()).filter(Boolean);
}

export async function phoneLoginStart(phone, country) {
  const body = { phone };
  if (country) body.country = String(country).toUpperCase();
  const res = await axios.post(`${baseUrl()}/api/auth/phone/login/start`, body);
  return res.data;
}

export async function phoneLoginVerify(phone, code, country) {
  const body = { phone, code };
  if (country) body.country = String(country).toUpperCase();
  const res = await axios.post(`${baseUrl()}/api/auth/phone/login/verify`, body);
  return res.data;
}