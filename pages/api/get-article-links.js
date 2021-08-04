import chromium from "chrome-aws-lambda";

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

export default async (req, res) => {
  const url = req.body.url;

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
        path: 'trace.json',
        categories: ['devtools.timeline']
      });

    const stories = await page.$$eval('a.storylink', anchors => { return anchors.map(anchor => anchor.textContent).slice(0, 10) })
  console.log("stories",stories)
  await page.tracing.stop()
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
};
