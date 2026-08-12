(() => {
  const textarea = [...document.querySelectorAll('textarea[name="comment[body]"]')].find(
    (element) => element.offsetParent !== null,
  );

  if (!textarea) {
    alert("GitHubのPRのConversation画面で実行してください。");
    return;
  }

  if (textarea.value.trim()) {
    alert("入力中のコメントがあるため投稿しませんでした。");
    return;
  }

  const form = textarea.closest("form");
  const submitButton = [
    ...(form?.querySelectorAll(
      'button[type="submit"]:not([name="comment_and_close"]):not([name="comment_and_reopen"])',
    ) ?? []),
  ].find((button) => button.offsetParent !== null);

  if (!submitButton) {
    alert("コメント投稿ボタンが見つかりませんでした。");
    return;
  }

  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  ).set;
  valueSetter.call(textarea, "@codex");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const deadline = Date.now() + 3000;
  const postWhenReady = () => {
    if (!submitButton.disabled) {
      submitButton.click();
      return;
    }
    if (Date.now() >= deadline) {
      alert("コメントを投稿できませんでした。");
      return;
    }
    requestAnimationFrame(postWhenReady);
  };

  postWhenReady();
})();
