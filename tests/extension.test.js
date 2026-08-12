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
    await page.goto("https://github.com/octocat/Hello-World/pull/1", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("#add-atcodex-comment-button", { visible: true });
    await page.evaluate(() => {
      const container = document.getElementById("s4na-github-floating-actions");
      container.insertAdjacentHTML(
        "beforeend",
        '<button data-s4na-floating-action="zzz-extension">Z</button>',
      );
      document.body.insertAdjacentHTML(
        "afterbegin",
        '<form action="/octocat/Hello-World/issues/1/comments">' +
          '<textarea name="comment[body]"></textarea>' +
          '<button id="test-submit" type="submit">Comment</button></form>',
      );
      document.dispatchEvent(new Event("turbo:load"));
    });
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
  } finally {
    await browser.close();
  }
});
