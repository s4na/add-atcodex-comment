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

for (const [formName, formAction] of [
  ["current PR form", "/octocat/Hello-World/pull/1/comment?sticky=true"],
  ["legacy issue comment form", "/octocat/Hello-World/issues/1/comments"],
]) {
  test(`loads in Chrome and posts @codex from a fixed button on the ${formName}`, async () => {
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
    await page.evaluate((action) => {
      const container = document.getElementById("s4na-github-floating-actions");
      container.insertAdjacentHTML(
        "beforeend",
        '<button data-s4na-floating-action="aaa-extension">A</button>',
      );
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<form action="${action}" style="visibility: hidden">` +
          '<textarea id="hidden-comment" name="comment[body]"></textarea>' +
          '<button type="submit">Comment</button></form>' +
          `<form id="visible-comment-form" action="${action}">` +
          '<textarea id="visible-comment" name="comment[body]" style="position: fixed"> \n</textarea>' +
          '<button id="test-submit" type="submit" style="position: fixed" disabled>Comment</button></form>',
      );
      document.getElementById("visible-comment").addEventListener("input", (event) => {
        window.__inputWasTrusted = event.isTrusted;
        if (event.isTrusted) {
          document.getElementById("test-submit").disabled = false;
        }
      });
      document.dispatchEvent(new Event("turbo:load"));
    }, formAction);
    assert.equal(await page.$eval("#s4na-github-floating-actions", (el) => getComputedStyle(el).position), "fixed");
    assert.deepEqual(
      await page.$$eval("[data-s4na-floating-action]", (elements) =>
        elements.map((element) => element.dataset.s4naFloatingAction),
      ),
      ["aaa-extension", "add-atcodex-comment"],
    );
    await page.$eval("#visible-comment-form", (form) => {
      window.__testFormSubmitted = false;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        window.__testFormSubmitted = true;
      });
    });
    await page.click("#add-atcodex-comment-button");
    await page.waitForFunction(() => document.getElementById("visible-comment").value === "@codex");
    assert.equal(await page.evaluate(() => window.__inputWasTrusted), true);
    assert.equal(await page.$eval("#hidden-comment", (textarea) => textarea.value), "");
    await page.waitForFunction(() => window.__testFormSubmitted);
  } finally {
    await browser.close();
  }
  });
}
