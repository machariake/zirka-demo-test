import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import "@payloadcms/next/css";
import "./custom.css";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import React from "react";
import { Urbanist } from "next/font/google";
import { importMap } from "./admin/importMap.js";

type Args = { children: React.ReactNode };

// The website's own typeface, so the admin looks like the same brand. Next
// self-hosts it with the build: no request to Google, nothing to wait on.
const urbanist = Urbanist({
  variable: "--zk-font",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    htmlProps={{ className: urbanist.variable }}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
