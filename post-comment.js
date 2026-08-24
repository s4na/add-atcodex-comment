(() => {
  const actionContainerId = "s4na-github-floating-actions";
  const actionAttribute = "data-s4na-floating-action";
  const applicationName = "add-atcodex-comment";
  const buttonId = "add-atcodex-comment-button";

  const registerFloatingAction = (button) => {
    let container = document.getElementById(actionContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = actionContainerId;
      document.body.append(container);
    }

    button.setAttribute(actionAttribute, applicationName);
    container.append(button);

    [...container.querySelectorAll(`[${actionAttribute}]`)]
      .sort((left, right) =>
        left
          .getAttribute(actionAttribute)
          .localeCompare(right.getAttribute(actionAttribute), "en"),
      )
      .forEach((action) => container.append(action));
  };

  const isConversationPage = () =>
    /^\/[^/]+\/[^/]+\/pull\/\d+\/?$/.test(location.pathname);

  const isVisible = (element) => {
    const style = element.ownerDocument.defaultView.getComputedStyle(element);
    return (
      element.getClientRects().length > 0 &&
      style.visibility !== "hidden" &&
      style.visibility !== "collapse"
    );
  };

  const postComment = () => {
  const formAndTextarea = [...document.querySelectorAll("form")].map((form) => {
    const textarea = [...form.querySelectorAll('textarea[name="comment[body]"]')].find(isVisible);
    const action = new URL(form.action, location.href);
    const isCommentForm =
      /^\/[^/]+\/[^/]+\/pull\/\d+\/comment$/.test(action.pathname) ||
      /^\/[^/]+\/[^/]+\/issues\/\d+\/comments$/.test(action.pathname);
    return isCommentForm && textarea ? { form, textarea } : null;
  }).find(Boolean);
  const form = formAndTextarea?.form;
  const textarea = formAndTextarea?.textarea;

  if (!textarea) {
    alert("GitHubのPRのConversation画面で実行してください。");
    return;
  }

  if (textarea.value.trim()) {
    alert("入力中のコメントがあるため投稿しませんでした。");
    return;
  }

  const submitButton = [
    ...(form?.querySelectorAll(
      'button[type="submit"]:not([name="comment_and_close"]):not([name="comment_and_reopen"])',
    ) ?? []),
  ].find(isVisible);

  if (!submitButton) {
    alert("コメント投稿ボタンが見つかりませんでした。");
    return;
  }

  textarea.focus();
  textarea.setSelectionRange(0, textarea.value.length);
  if (!document.execCommand("insertText", false, "@codex")) {
    alert("コメント欄に入力できませんでした。");
    return;
  }

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
  };

  const renderButton = () => {
    document.getElementById(buttonId)?.remove();

    if (!isConversationPage()) {
      return;
    }

    const button = document.createElement("button");
    button.id = buttonId;
    button.type = "button";
    button.textContent = "@codex";
    button.addEventListener("click", postComment);
    registerFloatingAction(button);
  };

  renderButton();
  document.addEventListener("turbo:load", renderButton);
})();
