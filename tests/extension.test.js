const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const puppeteer = require("puppeteer");

const extensionPath = path.resolve(__dirname, "..");

test("manifest resources exist", () => {
  const manifest = require("../manifest.json");
  const resources = manifest.content_scripts.flatMap(({ js = [], css = [] }) => [...js, ...css]);
  for (const resource of resources) {
    assert.ok(fs.existsSync(path.join(extensionPath, resource)), `missing: ${resource}`);
  }
});

test("loads in Chrome and posts @codex from a fixed button", async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    pipe: true,
    enableExtensions: [extensionPath],
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.isNavigationRequest()) {
        request.respond({
          status: 200,
          contentType: "text/html",
          body: `<!doctype html><div id="s4na-github-floating-actions">
            <button data-s4na-floating-action="zzz-extension">Z</button>
          </div><form action="/octo/repo/issues/1/comments">
            <textarea name="comment[body]"></textarea>
            <button id="submit" type="submit">Comment</button>
          </form><div style="height: 2000px"></div>`,
        });
      } else {
        request.continue();
      }
    });

    await page.goto("https://github.com/octo/repo/pull/1");
    await page.waitForSelector("#add-atcodex-comment-button", { visible: true });
    assert.equal(await page.$eval("#s4na-github-floating-actions", (el) => getComputedStyle(el).position), "fixed");
    assert.deepEqual(
      await page.$$eval("[data-s4na-floating-action]", (elements) =>
        elements.map((element) => element.dataset.s4naFloatingAction),
      ),
      ["add-atcodex-comment", "zzz-extension"],
    );
    await page.$eval("form", (form) => form.addEventListener("submit", (event) => event.preventDefault()));
    await page.click("#add-atcodex-comment-button");
    await page.waitForFunction(() => document.querySelector('textarea[name="comment[body]"]').value === "@codex");
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
