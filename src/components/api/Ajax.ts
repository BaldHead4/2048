import axios from "axios";
import { AjaxMethod } from "../types";

export function Ajax(method: AjaxMethod, url: string, args?: any) {
  return axios({
    method: method,
    url: `http://localhost:8090${url}`,
    params: method === "GET" ? args : null,
    data: method === "POST" ? args : null,
  });
}
