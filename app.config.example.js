import ip from "ip";

export const scheme = "http";
export const host = ip.address();
export const port = 49725;
export const baseUrl = scheme + "://" + host + ":" + port;
