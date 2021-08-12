import chromium from "chrome-aws-lambda";
import * as cron from "node-cron";
import AWS from "aws-sdk";

const S3 = new AWS.S3({
  signatureVersion: "v4",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  },
});

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

export default async function handler(req, res) {
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

    const fileName = "uploaded_on_" + Date.now() + ".json";
    const params = {
      Bucket: "aws-daily-defi",
      Key: fileName,
      Body: JSON.stringify(stories),
      ContentType: "application/json",
    };

    S3.upload(params, (error, data) => {
      console.log(error, data);
      if (error) {
        return res.json({
          status: "error",
          error: error.message || "Something went wrong",
        });
      }

      const params = {
        Bucket: "aws-daily-defi",
        Key: fileName,
        Expires: 600,
      };

      const signedURL = S3.getSignedUrl("getObject", params);

      res.json({
        status: "ok",
        data: signedURL,
      });
    });

    await page.tracing.stop();
  } catch (error) {
    //   return callback(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  //   });
}

// cron.schedule("5 * * * * *", handler);
