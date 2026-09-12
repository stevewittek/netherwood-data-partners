"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SiteHeader } from "../components/SiteChrome";
import {
  blankEditor,
  editorFromArticle,
  fromUtcInputString,
  isFutureDate,
  isoLabel,
  slugify,
  toUtcInputString,
  type AdminArticle,
  type EditorValue,
  type NoticeState,
} from "./admin-utils.ts";

export type { AdminArticle, EditorValue, NoticeState };
export { blankEditor, editorFromArticle, fromUtcInputString, isFutureDate, isoLabel, slugify, toUtcInputString };

const defaultEnvApiUrl = (import.meta.env?.VITE_VOYAGER_API_URL as string | undefined)?.replace(/\/$/, "") || "";

export default function ArticlesAdmin() {
  const [token, setToken] = useState("");
  const [apiUrl, setApiUrl] = useState(defaultEnvApiUrl || "http://127.0.0.1:3000");
  const [authenticated, setAuthenticated] = useState(false);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [editor, setEditor] = useState<EditorValue>(blankEditor);
  const [savedEditor, setSavedEditor] = useState<EditorValue | undefined>(blankEditor);
  const [previewHtml, setPreviewHtml] = useState("");
  const [mode, setMode] = useState<"list" | "edit" | "preview">("list");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [showReauth, setShowReauth] = useState(false);
  const [currentUtcTime, setCurrentUtcTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentUtcTime(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = "Article publishing | Netherwood Data Partners";
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content = "noindex, nofollow, noarchive";
  }, []);

  const isDirty = useMemo(() => {
    if (mode === "list" || !savedEditor) return false;
    return JSON.stringify(editor) !== JSON.stringify(savedEditor);
  }, [editor, savedEditor, mode]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function request<T>(
    path: string,
    init: RequestInit = {},
    overrideToken?: string,
    overrideUrl?: string,
  ): Promise<T> {
    const endpoint = (overrideUrl ?? apiUrl).replace(/\/$/, "");
    if (!endpoint) throw new Error("Voyager API URL is required.");
    const bearer = overrideToken ?? token;
    let response: Response;
    try {
      response = await fetch(`${endpoint}${path}`, {
        ...init,
        headers: {
          authorization: `Bearer ${bearer}`,
          ...(init.body ? { "content-type": "application/json" } : {}),
          ...init.headers,
        },
      });
    } catch (networkError) {
      const msg = networkError instanceof Error ? networkError.message : "Network error";
      throw new Error(`Cannot reach Voyager API at ${endpoint}. Ensure the private backend is running. (${msg})`);
    }

    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      fields?: Record<string, string>;
    } & T;

    if (!response.ok) {
      if (body.fields) {
        setFieldErrors(body.fields);
      }
      if (response.status === 401) {
        if (authenticated) {
          setShowReauth(true);
        }
        throw new Error("The publishing credential was not accepted (401 Unauthorized).");
      }
      if (response.status === 403) {
        throw new Error("Browser origin is not allowlisted by Voyager (403 Origin Not Allowed).");
      }
      if (response.status === 429) {
        throw new Error("Rate limit reached. Please wait a moment before trying again (429 Rate Limited).");
      }
      if (body.error === "article_must_be_unpublished") {
        throw new Error("Unpublish this article before deleting it.");
      }
      if (response.status === 409 || body.error === "slug_conflict") {
        throw new Error("That URL slug is already used by another article.");
      }
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(`Voyager API is temporarily unavailable (${response.status}). Unsaved edits are preserved.`);
      }
      throw new Error(body.error === "not_found" ? "Article not found." : "Voyager could not complete the request.");
    }
    return body;
  }

  async function loadList(overrideToken?: string, overrideUrl?: string): Promise<void> {
    const result = await request<{ articles: AdminArticle[] }>(
      "/api/admin/articles",
      {},
      overrideToken,
      overrideUrl,
    );
    setArticles(result.articles);
  }

  async function signIn(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    setFieldErrors({});
    try {
      await loadList(token, apiUrl);
      setAuthenticated(true);
      setShowReauth(false);
      setNotice({ type: "success", text: "Connected to Voyager Article Desk." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to connect to Voyager API.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function reauthenticate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    try {
      await loadList(reauthPassword, apiUrl);
      setToken(reauthPassword);
      setReauthPassword("");
      setShowReauth(false);
      setNotice({ type: "success", text: "Credential updated. You can now save your changes." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "The re-entered credential was not accepted.",
      });
    } finally {
      setBusy(false);
    }
  }

  function lockDesk(): void {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes in the editor. Locking the desk will discard them. Continue?")) {
        return;
      }
    }
    setToken("");
    setAuthenticated(false);
    setSelectedId(undefined);
    setEditor(blankEditor);
    setSavedEditor(blankEditor);
    setArticles([]);
    setPreviewHtml("");
    setMode("list");
    setNotice(null);
    setFieldErrors({});
    setShowReauth(false);
  }

  function newArticle(): void {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Discard them and create a new article?")) {
        return;
      }
    }
    setSelectedId(undefined);
    setEditor(blankEditor);
    setSavedEditor(blankEditor);
    setFieldErrors({});
    setPreviewHtml("");
    setSlugTouched(false);
    setNotice(null);
    setMode("edit");
  }

  function navigateToList(): void {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Discard them and return to the article list?")) {
        return;
      }
    }
    setFieldErrors({});
    setNotice(null);
    setMode("list");
  }

  async function editArticle(articleId: string, preview = false): Promise<void> {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Discard them to open this article?")) {
        return;
      }
    }
    setBusy(true);
    setNotice(null);
    setFieldErrors({});
    try {
      const result = await request<{ article: AdminArticle }>(`/api/admin/articles/${articleId}`);
      setSelectedId(articleId);
      const parsedEditor = editorFromArticle(result.article);
      setEditor(parsedEditor);
      setSavedEditor(parsedEditor);
      setSlugTouched(true);
      setPreviewHtml(result.article.html ?? "");
      setMode(preview ? "preview" : "edit");
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load article from SQL.",
      });
    } finally {
      setBusy(false);
    }
  }

  function buildPayload(): Record<string, unknown> {
    return {
      title: editor.title.trim(),
      slug: editor.slug.trim(),
      summary: editor.summary.trim(),
      category: editor.category.trim(),
      tags: editor.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      author: editor.author.trim(),
      featuredImage: editor.featuredImage.trim() || undefined,
      seoTitle: editor.seoTitle.trim() || undefined,
      seoDescription: editor.seoDescription.trim() || undefined,
      publishedDate: fromUtcInputString(editor.publishedDate),
      isFeatured: editor.isFeatured,
      html: editor.html,
    };
  }

  async function saveDraft(): Promise<AdminArticle | undefined> {
    setBusy(true);
    setNotice(null);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      const result = selectedId
        ? await request<{ article: AdminArticle }>(`/api/admin/articles/${selectedId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await request<{ article: AdminArticle }>("/api/admin/articles", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      setSelectedId(result.article.articleId);
      const updatedEditor = editorFromArticle(result.article);
      setEditor(updatedEditor);
      setSavedEditor(updatedEditor);
      setSlugTouched(true);

      const noticeMsg =
        result.article.status === "Published"
          ? "Unpublished draft edits saved in SQL. The live website serves the previously published version until you click Publish."
          : "Draft saved in SQL.";

      setNotice({ type: "success", text: noticeMsg });
      await loadList();
      return result.article;
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save draft in SQL. Your edits remain in the editor.",
      });
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  async function preview(): Promise<void> {
    setBusy(true);
    setNotice(null);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      const result = await request<{ html: string }>("/api/admin/articles/preview", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setPreviewHtml(result.html);
      setMode("preview");
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to generate preview.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(
    articleId: string,
    action: "publish" | "unpublish" | "archive",
    articleTitle?: string,
  ): Promise<void> {
    const title = articleTitle ?? editor.title ?? "this article";
    if (action === "unpublish") {
      if (
        !window.confirm(
          `Unpublish “${title}”? This reverts the article to Draft in SQL and removes it from the public website on the next export cycle.`,
        )
      ) {
        return;
      }
    }
    if (action === "archive") {
      if (
        !window.confirm(
          `Archive “${title}”? This removes the article from public view and sitemaps.`,
        )
      ) {
        return;
      }
    }

    setBusy(true);
    setNotice(null);
    try {
      const result = await request<{ article: AdminArticle }>(
        `/api/admin/articles/${articleId}/${action}`,
        { method: "POST" },
      );
      const expectedStatus =
        action === "publish" ? "Published" : action === "unpublish" ? "Draft" : "Archived";
      if (result.article.status !== expectedStatus) {
        throw new Error(`Voyager did not ${action} the article.`);
      }

      let verbMsg = "";
      if (action === "publish") {
        if (isFutureDate(result.article.publishedDate, currentUtcTime)) {
          verbMsg = `Scheduled “${result.article.title}” in SQL for ${isoLabel(result.article.publishedDate)}. It will go live once due.`;
        } else {
          verbMsg = `Published “${result.article.title}” in SQL. It will deploy to the public website on the next 15-minute export cycle.`;
        }
      } else if (action === "unpublish") {
        verbMsg = `Unpublished “${result.article.title}” in SQL. Reverted to Draft; will be removed on the next export cycle.`;
      } else {
        verbMsg = `Archived “${result.article.title}” in SQL. Removed from public view.`;
      }

      setNotice({ type: "success", text: verbMsg });
      await loadList();

      if (selectedId === articleId) {
        const updatedEditor = editorFromArticle(result.article);
        setEditor(updatedEditor);
        setSavedEditor(updatedEditor);
        setPreviewHtml(result.article.html ?? "");
      }
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : `Unable to ${action} article in SQL.`,
      });
    } finally {
      setBusy(false);
    }
  }

  async function publishEditor(): Promise<void> {
    const saved = await saveDraft();
    if (saved) {
      await changeStatus(saved.articleId, "publish", saved.title);
    }
  }

  async function deleteArticle(article: AdminArticle): Promise<void> {
    if (article.status === "Published") {
      setNotice({
        type: "warning",
        text: "Unpublish this article before deleting it. Published articles cannot be deleted directly.",
      });
      return;
    }
    if (
      !window.confirm(
        `Permanently delete “${article.title}”? This cannot be undone and deletes both the article record and its draft from SQL.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      await request<{ deleted: true }>(`/api/admin/articles/${article.articleId}`, {
        method: "DELETE",
      });
      setNotice({ type: "success", text: `Deleted “${article.title}” from SQL.` });
      if (selectedId === article.articleId) {
        setSelectedId(undefined);
        setEditor(blankEditor);
        setSavedEditor(blankEditor);
        setMode("list");
      }
      await loadList();
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to delete article from SQL.",
      });
    } finally {
      setBusy(false);
    }
  }

  function updateField(field: keyof EditorValue, value: string): void {
    setEditor((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  const selectedArticle = articles.find((article) => article.articleId === selectedId);

  const scheduledUtcPreview = useMemo(() => {
    if (!editor.publishedDate) return "Immediate (published on publish action)";
    try {
      const iso = fromUtcInputString(editor.publishedDate);
      if (!iso) return "";
      const date = new Date(iso);
      if (isNaN(date.getTime())) return "Invalid date";
      const isFuture = date.getTime() > currentUtcTime;
      return `${isoLabel(iso)} ${isFuture ? "(Scheduled future release)" : "(Immediate / past date)"}`;
    } catch {
      return "";
    }
  }, [editor.publishedDate, currentUtcTime]);

  if (!authenticated) {
    return (
      <main className="admin-page">
        <SiteHeader />
        <section className="admin-login" aria-labelledby="admin-title">
          <p className="eyebrow">Private publishing</p>
          <h1 id="admin-title">Article desk</h1>
          <p>
            Connect to Voyager 2 to manage SQL-backed articles. Credentials and tokens are held only in this
            session’s browser memory and are never saved to disk or persistent storage.
          </p>
          <form onSubmit={signIn} noValidate>
            {!defaultEnvApiUrl ? (
              <label htmlFor="admin-api-url">
                Voyager API Endpoint
                <span className="admin-field-hint">Private API URL (e.g. http://127.0.0.1:3000 or secure tunnel)</span>
                <input
                  id="admin-api-url"
                  type="text"
                  autoComplete="off"
                  value={apiUrl}
                  onChange={(event) => setApiUrl(event.target.value)}
                  placeholder="http://127.0.0.1:3000"
                  required
                />
              </label>
            ) : null}
            <label htmlFor="admin-token">
              Publishing credential
              <span className="admin-field-hint">Private publishing bearer credential</span>
              <input
                id="admin-token"
                type="password"
                autoComplete="off"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Enter publishing credential"
                required
              />
            </label>
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? "Connecting..." : "Open article desk"}
            </button>
          </form>
          {notice ? (
            <p
              className={`admin-notice ${
                notice.type === "error"
                  ? "admin-notice-error"
                  : notice.type === "success"
                  ? "admin-notice-success"
                  : "admin-notice-warning"
              }`}
              role="alert"
            >
              {notice.text}
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-bar">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            N
          </span>
          <span className="brand-name">
            Netherwood <strong>Article Desk</strong>
          </span>
        </a>
        <div>
          <span className="admin-conn-status" title={`Connected to ${apiUrl}`}>
            <span className="admin-conn-dot" aria-hidden="true" />
            Connected to Voyager API
          </span>
          <a href="/articles" target="_blank" rel="noreferrer">
            View public articles
          </a>
          <button type="button" onClick={lockDesk} aria-label="Lock publishing desk and clear memory">
            Lock desk
          </button>
        </div>
      </header>

      <div className="admin-workspace">
        {showReauth ? (
          <aside className="admin-reauth-banner" role="alert">
            <div>
              <strong>Session credential expired or rejected (401)</strong>
              <p>Your unsaved edits are preserved in the editor. Enter the publishing credential to continue.</p>
            </div>
            <form onSubmit={reauthenticate}>
              <input
                type="password"
                placeholder="Publishing token"
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                required
              />
              <button type="submit" className="button button-primary" disabled={busy}>
                Update Token
              </button>
            </form>
          </aside>
        ) : null}

        <section className="admin-heading">
          <div>
            <p className="eyebrow">Private publishing</p>
            <h1>
              {mode === "list"
                ? "Articles"
                : mode === "preview"
                ? "Preview article"
                : selectedId
                ? "Edit article"
                : "New article"}
            </h1>
          </div>
          {mode === "list" ? (
            <button className="button button-primary" type="button" onClick={newArticle} disabled={busy}>
              New Article
            </button>
          ) : (
            <button className="admin-back" type="button" onClick={navigateToList} disabled={busy}>
              ← Article list
            </button>
          )}
        </section>

        {notice ? (
          <p
            className={`admin-notice ${
              notice.type === "error"
                ? "admin-notice-error"
                : notice.type === "success"
                ? "admin-notice-success"
                : "admin-notice-warning"
            }`}
            role="status"
          >
            {notice.text}
          </p>
        ) : null}

        {mode === "list" ? (
          <div className="admin-table-wrap">
            <div className="admin-table-summary">
              <span>{articles.length} total articles in SQL</span>
              <span>
                {articles.filter((a) => a.status === "Published" && !isFutureDate(a.publishedDate, currentUtcTime)).length} published
              </span>
              <span>{articles.filter((a) => a.status === "Draft").length} drafts</span>
              <span>{articles.filter((a) => a.status === "Published" && isFutureDate(a.publishedDate, currentUtcTime)).length} scheduled</span>
            </div>
            <table className="admin-table" aria-label="Articles list">
              <thead>
                <tr>
                  <th scope="col">Title &amp; Slug</th>
                  <th scope="col">Status</th>
                  <th scope="col">Category</th>
                  <th scope="col">SQL Modified (UTC)</th>
                  <th scope="col">SQL Published (UTC)</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => {
                  const scheduled = article.status === "Published" && isFutureDate(article.publishedDate, currentUtcTime);
                  return (
                    <tr key={article.articleId}>
                      <td>
                        <strong>{article.title}</strong>
                        <span className="admin-slug-hint">/articles/{article.slug}</span>
                        {article.hasUnpublishedChanges ? (
                          <span className="draft-change">Unpublished draft changes staged</span>
                        ) : null}
                      </td>
                      <td>
                        <span
                          className={`status-label status-${article.status.toLowerCase()} ${
                            scheduled ? "status-scheduled" : ""
                          }`}
                        >
                          {scheduled ? "Scheduled" : article.status}
                        </span>
                      </td>
                      <td>{article.category}</td>
                      <td>{isoLabel(article.modifiedDate)}</td>
                      <td>{isoLabel(article.publishedDate)}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void editArticle(article.articleId)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void editArticle(article.articleId, true)}
                          >
                            Preview
                          </button>
                          {article.status === "Published" ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void changeStatus(article.articleId, "unpublish", article.title)}
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void changeStatus(article.articleId, "publish", article.title)}
                            >
                              Publish
                            </button>
                          )}
                          {article.status !== "Published" && article.status !== "Archived" ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void changeStatus(article.articleId, "archive", article.title)}
                            >
                              Archive
                            </button>
                          ) : null}
                          {article.status !== "Published" ? (
                            <button
                              className="danger-action"
                              type="button"
                              disabled={busy}
                              onClick={() => void deleteArticle(article)}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {articles.length === 0 ? (
              <p className="admin-empty">No articles found in SQL. Click “New Article” to create a draft.</p>
            ) : null}
          </div>
        ) : null}

        {mode === "edit" ? (
          <div>
            {selectedArticle ? (
              <div className="admin-article-meta-card">
                <div className="admin-meta-row">
                  <span>
                    <strong>SQL Status:</strong>{" "}
                    <span className={`status-label status-${selectedArticle.status.toLowerCase()}`}>
                      {selectedArticle.status}
                    </span>
                  </span>
                  <span>
                    <strong>Article ID:</strong> <code>{selectedArticle.articleId}</code>
                  </span>
                  <span>
                    <strong>Created:</strong> {isoLabel(selectedArticle.createdDate)}
                  </span>
                  <span>
                    <strong>Modified:</strong> {isoLabel(selectedArticle.modifiedDate)}
                  </span>
                  <span>
                    <strong>Published:</strong> {isoLabel(selectedArticle.publishedDate)}
                  </span>
                </div>
                <p className="admin-sync-explanation">
                  {selectedArticle.status === "Published"
                    ? isFutureDate(selectedArticle.publishedDate, currentUtcTime)
                      ? `Scheduled in SQL for release on ${isoLabel(selectedArticle.publishedDate)}. It will automatically deploy on the first 15-minute export cycle once due.`
                      : "Published in SQL. Changes are deployed to the public website via the automated 15-minute export cycle."
                    : selectedArticle.status === "Draft"
                    ? "Saved in SQL as Draft. Not visible on the public website."
                    : "Archived in SQL. Hidden from public website and search."}
                </p>
                {selectedArticle.hasUnpublishedChanges ? (
                  <p className="admin-staged-warning">
                    ⚠️ Draft has unpublished edits saved in SQL. The live website serves the previously published version until you click Publish.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="admin-article-meta-card">
                <p className="admin-sync-explanation">
                  New Draft. Saving will stage this article in SQL. It will not be published to the website until you explicitly click Publish.
                </p>
              </div>
            )}

            <form
              className="article-editor"
              onSubmit={(event) => {
                event.preventDefault();
                void saveDraft();
              }}
              noValidate
            >
              <div className="editor-fields">
                <label htmlFor="field-title">
                  Title
                  <input
                    id="field-title"
                    value={editor.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="Article title"
                    required
                  />
                  {fieldErrors.title ? <small>{fieldErrors.title}</small> : null}
                </label>

                <label htmlFor="field-slug">
                  URL slug
                  <span className="admin-field-hint">Used for /articles/[slug] route (letters, numbers, hyphens)</span>
                  <div className="slug-input">
                    <span>/articles/</span>
                    <input
                      id="field-slug"
                      value={editor.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        updateField("slug", event.target.value);
                      }}
                      placeholder="article-url-slug"
                      required
                    />
                  </div>
                  {fieldErrors.slug ? <small>{fieldErrors.slug}</small> : null}
                </label>

                <label htmlFor="field-summary">
                  Summary / Deck
                  <span className="admin-field-hint">Displayed in article index, card decks, and search results</span>
                  <textarea
                    id="field-summary"
                    className="summary-field"
                    value={editor.summary}
                    onChange={(event) => updateField("summary", event.target.value)}
                    placeholder="Concise overview of the article"
                    required
                  />
                  {fieldErrors.summary ? <small>{fieldErrors.summary}</small> : null}
                </label>

                <label htmlFor="field-seo-title">
                  SEO title
                  <span className="admin-field-hint">Optional; the article title is used when blank</span>
                  <input
                    id="field-seo-title"
                    maxLength={300}
                    value={editor.seoTitle}
                    onChange={(event) => updateField("seoTitle", event.target.value)}
                    placeholder="Custom search title"
                  />
                  {fieldErrors.seoTitle ? <small>{fieldErrors.seoTitle}</small> : null}
                </label>

                <label htmlFor="field-seo-description">
                  SEO description
                  <span className="admin-field-hint">Optional; the summary is used when blank</span>
                  <textarea
                    id="field-seo-description"
                    className="summary-field"
                    maxLength={500}
                    value={editor.seoDescription}
                    onChange={(event) => updateField("seoDescription", event.target.value)}
                    placeholder="Custom meta description"
                  />
                  {fieldErrors.seoDescription ? <small>{fieldErrors.seoDescription}</small> : null}
                </label>

                <div className="editor-grid">
                  <label htmlFor="field-category">
                    Category
                    <input
                      id="field-category"
                      value={editor.category}
                      onChange={(event) => updateField("category", event.target.value)}
                      placeholder="e.g. SQL Server"
                      required
                    />
                    {fieldErrors.category ? <small>{fieldErrors.category}</small> : null}
                  </label>
                  <label htmlFor="field-author">
                    Author
                    <input
                      id="field-author"
                      value={editor.author}
                      onChange={(event) => updateField("author", event.target.value)}
                      placeholder="Steven Wittek"
                      required
                    />
                    {fieldErrors.author ? <small>{fieldErrors.author}</small> : null}
                  </label>
                </div>

                <label htmlFor="field-pub-date">
                  Publication time (UTC)
                  <span className="admin-field-hint">
                    Stored in UTC. Leave blank to publish immediately on publish action.
                  </span>
                  <input
                    id="field-pub-date"
                    type="datetime-local"
                    step="60"
                    value={editor.publishedDate}
                    onChange={(event) => updateField("publishedDate", event.target.value)}
                  />
                  {scheduledUtcPreview ? (
                    <span className="admin-utc-indicator">{scheduledUtcPreview}</span>
                  ) : null}
                  {fieldErrors.publishedDate ? <small>{fieldErrors.publishedDate}</small> : null}
                </label>

                <label htmlFor="field-tags">
                  Tags
                  <span className="admin-field-hint">Comma separated topics</span>
                  <input
                    id="field-tags"
                    value={editor.tags}
                    onChange={(event) => updateField("tags", event.target.value)}
                    placeholder="SQL Server, performance, backups"
                  />
                  {fieldErrors.tags ? <small>{fieldErrors.tags}</small> : null}
                </label>

                <label htmlFor="field-image">
                  Featured image
                  <span className="admin-field-hint">Optional relative image path (e.g. /images/hero.jpg) or HTTPS URL</span>
                  <input
                    id="field-image"
                    value={editor.featuredImage}
                    onChange={(event) => updateField("featuredImage", event.target.value)}
                    placeholder="/images/article-hero.jpg"
                  />
                  {fieldErrors.featuredImage ? <small>{fieldErrors.featuredImage}</small> : null}
                </label>

                <label className="checkbox-field" htmlFor="field-featured">
                  <input
                    id="field-featured"
                    type="checkbox"
                    checked={editor.isFeatured}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, isFeatured: event.target.checked }))
                    }
                  />
                  <span>Feature this article prominently on the Articles page</span>
                </label>
              </div>

              <div className="content-editor">
                <div className="editor-tabs" aria-label="Editing mode">
                  <button type="button" className="active">
                    HTML Source <span>(Sanitized server-side)</span>
                  </button>
                </div>
                <label htmlFor="article-html">
                  Article Content (HTML)
                  <span className="admin-field-hint">
                    Standard formatting allowed: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;pre&gt;&lt;code&gt;, &lt;blockquote&gt;, &lt;table&gt;, &lt;aside class=&quot;callout&quot;&gt;. Scripts and inline styles are stripped safely.
                  </span>
                </label>
                <textarea
                  id="article-html"
                  spellCheck="false"
                  value={editor.html}
                  onChange={(event) => updateField("html", event.target.value)}
                  placeholder="<p>Write article content in HTML...</p>"
                  required
                />
                <div className="admin-content-stats">
                  <span>{editor.html.length} characters</span>
                  <span>{editor.html.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                {fieldErrors.html ? <small>{fieldErrors.html}</small> : null}
              </div>

              <div className="editor-buttons">
                <button className="button" type="submit" disabled={busy}>
                  {busy ? "Saving..." : "Save Draft in SQL"}
                </button>
                <button className="button" type="button" onClick={() => void preview()} disabled={busy}>
                  Preview
                </button>
                {selectedArticle?.status === "Published" ? (
                  <button
                    className="button"
                    type="button"
                    onClick={() => void changeStatus(selectedArticle.articleId, "unpublish", selectedArticle.title)}
                    disabled={busy}
                  >
                    Unpublish
                  </button>
                ) : null}
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => void publishEditor()}
                  disabled={busy}
                >
                  {busy ? "Publishing..." : "Publish to Website"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {mode === "preview" ? (
          <section className="admin-preview" aria-label="Article preview">
            <div className="preview-toolbar">
              <div>
                <span>Private preview (Sanitized Server-Side)</span>
                <strong>{editor.title || "Untitled article"}</strong>
              </div>
              <button type="button" onClick={() => setMode("edit")}>
                Return to editor
              </button>
            </div>
            <header className="article-header">
              <div className="article-kicker">
                <span>{editor.category || "Uncategorized"}</span>
                <span>Draft preview</span>
              </div>
              <h1>{editor.title || "Untitled article"}</h1>
              <p className="article-deck">{editor.summary}</p>
              <div className="article-byline">By {editor.author || "Steven Wittek"}</div>
            </header>
            <div className="article-layout">
              <aside className="article-rail">
                <span>Filed under</span>
                <strong>{editor.category || "General"}</strong>
                {editor.tags ? (
                  <ul>
                    {editor.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                  </ul>
                ) : null}
              </aside>
              <div className="article-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
