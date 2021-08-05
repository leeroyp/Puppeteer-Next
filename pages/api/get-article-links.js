import chromium from "chrome-aws-lambda";
import * as cron from "node-cron";
import { useState } from 'react'
import { useSrapperContext } from "../../context/state";

const test = () => {
    const [click, setClick] = useState(0)

}

async function getBrowserInstance() {
  const executablePath = await chromium.executablePath;

  if (!executablePath) {
    const puppeteer = require("puppeteer");
    return puppeteer.launch({
      args: chromium.args,
      headless: true,
      ignoreHTTPSErrors: true,
    });
  }
  return chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
}


export default async  function handler(req, res) {
//   cron.schedule("5 * * * * *", async () => {
    // const { links, setLinks } = useSrapperContext();
    
    const url = "https://bbc.com";

    //perfrom URL validation
    if (!url || !url.trim()) {
      res.json({
        status: "error",
        error: "Enter a valid URL",
      });
      return;
    }

    let result = null;
    let browser = null;

    try {
      browser = await getBrowserInstance();
      let page = await browser.newPage();
      await page.goto(url);
      result = await page.tracing.start({
        path: "trace.json",
        categories: ["devtools.timeline"],
      });

      const stories = await page.$$eval(".media-list .media a", (anchors) => {
        return anchors.map((anchor) => anchor.href).slice(0, 10);
      });
      console.log("stories", stories);

     
    //   setLinks(stories)
    //   console.log("links",links)

      await page.tracing.stop();
    } catch (error) {
      //   return callback(error);
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }

    res.json({
      status: "okay",
      data: result,
    });
//   });
};

cron.schedule('5 * * * * *', handler)