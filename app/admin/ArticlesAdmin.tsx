"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SiteHeader } from "../components/SiteChrome";

type AdminArticle = {
  articleId: string;
  title: string;
  slug: string;
  summary: string;
  html?: string;
  category: string;
  tags: string[];
  author: string;
  status: "Draft" | "Published" | "Archived";
  featuredImage?: string;
  seoDescription?: string;
  isFeatured: boolean;
  publishedDate?: string;
  createdDate: string;
  modifiedDate: string;
  hasUnpublishedChanges?: boolean;
};

type EditorValue = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string;
  author: string;
  featuredImage: string;
  seoDescription: string;
  isFeatured: boolean;
  html: string;
};

const apiUrl = (import.meta.env?.VITE_VOYAGER_API_URL as string | undefined)?.replace(/\/$/, "");
const blankEditor: EditorValue = {
  title: "",
  slug: "",
  summary: "",
  category: "SQL Server",
  tags: "",
  author: "Steven Wittek",
  featuredImage: "",
  seoDescription: "",
  isFeatured: false,
  html: "<p></p>",
};

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 200);
}

function editorFromArticle(article: AdminArticle): EditorValue {
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category,
    tags: article.tags.join(", "),
    author: article.author,
    featuredImage: article.featuredImage ?? "",
    seoDescription: article.seoDescription ?? "",
    isFeatured: article.isFeatured,
    html: article.html ?? "",
  };
}

function isoLabel(value?: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC";
}

export default function ArticlesAdmin() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [editor, setEditor] = useState<EditorValue>(blankEditor);
  const [previewHtml, setPreviewHtml] = useState("");
  const [mode, setMode] = useState<"list" | "edit" | "preview">("list");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(false);

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

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!apiUrl) throw new Error("Voyager API is not configured for this build.");
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${token}`, ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
    });
    const body = await response.json().catch(() => ({})) as { error?: string; fields?: Record<string, string> } & T;
    if (!response.ok) {
      if (body.fields) setFieldErrors(body.fields);
      if (response.status === 401) throw new Error("The publishing credential was not accepted.");
      if (body.error === "article_must_be_unpublished") throw new Error("Unpublish this article before deleting it.");
      if (response.status === 409) throw new Error("That URL slug is already used by another article.");
      throw new Error(body.error === "not_found" ? "Article not found." : "Voyager could not complete the request.");
    }
    return body;
  }

  async function loadList(): Promise<void> {
    const result = await request<{ articles: AdminArticle[] }>("/api/admin/articles");
    setArticles(result.articles);
  }

  async function signIn(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await loadList();
      setAuthenticated(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to connect.");
    } finally {
      setBusy(false);
    }
  }

  function newArticle(): void {
    setSelectedId(undefined);
    setEditor(blankEditor);
    setFieldErrors({});
    setPreviewHtml("");
    setSlugTouched(false);
    setMode("edit");
  }

  async function editArticle(articleId: string, preview = false): Promise<void> {
    setBusy(true);
    setNotice("");
    setFieldErrors({});
    try {
      const result = await request<{ article: AdminArticle }>(`/api/admin/articles/${articleId}`);
      setSelectedId(articleId);
      setEditor(editorFromArticle(result.article));
      setSlugTouched(true);
      setPreviewHtml(result.article.html ?? "");
      setMode(preview ? "preview" : "edit");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load article.");
    } finally {
      setBusy(false);
    }
  }

  function payload(): Record<string, unknown> {
    return {
      ...editor,
      tags: editor.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      featuredImage: editor.featuredImage || undefined,
      seoDescription: editor.seoDescription || undefined,
    };
  }

  async function saveDraft(): Promise<AdminArticle | undefined> {
    setBusy(true);
    setNotice("");
    setFieldErrors({});
    try {
      const result = selectedId
        ? await request<{ article: AdminArticle }>(`/api/admin/articles/${selectedId}`, { method: "PUT", body: JSON.stringify(payload()) })
        : await request<{ article: AdminArticle }>("/api/admin/articles", { method: "POST", body: JSON.stringify(payload()) });
      setSelectedId(result.article.articleId);
      setEditor(editorFromArticle(result.article));
      setSlugTouched(true);
      setNotice(result.article.status === "Published" ? "Unpublished changes saved. The live article is unchanged." : "Draft saved.");
      await loadList();
      return result.article;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save draft.");
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  async function preview(): Promise<void> {
    setBusy(true);
    setNotice("");
    setFieldErrors({});
    try {
      const result = await request<{ html: string }>("/api/admin/articles/preview", { method: "POST", body: JSON.stringify(payload()) });
      setPreviewHtml(result.html);
      setMode("preview");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to preview article.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(articleId: string, action: "publish" | "unpublish" | "archive"): Promise<void> {
    setBusy(true);
    setNotice("");
    try {
      const result = await request<{ article: AdminArticle }>(`/api/admin/articles/${articleId}/${action}`, { method: "POST" });
      const expectedStatus = action === "publish" ? "Published" : action === "unpublish" ? "Draft" : "Archived";
      if (result.article.status !== expectedStatus) throw new Error(`Voyager did not ${action} the article.`);
      const verb = action === "publish" ? "Published" : action === "unpublish" ? "Unpublished" : "Archived";
      setNotice(`${verb} “${result.article.title}”.`);
      await loadList();
      if (selectedId === articleId) {
        setEditor(editorFromArticle(result.article));
        setPreviewHtml(result.article.html ?? "");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Unable to ${action} article.`);
    } finally {
      setBusy(false);
    }
  }

  async function publishEditor(): Promise<void> {
    const saved = await saveDraft();
    if (saved) await changeStatus(saved.articleId, "publish");
  }

  async function deleteArticle(article: AdminArticle): Promise<void> {
    if (article.status === "Published") {
      setNotice("Unpublish this article before deleting it.");
      return;
    }
    if (!window.confirm(`Permanently delete “${article.title}”? This cannot be undone.`)) return;
    setBusy(true);
    setNotice("");
    try {
      await request<{ deleted: true }>(`/api/admin/articles/${article.articleId}`, { method: "DELETE" });
      setNotice(`Deleted “${article.title}”.`);
      if (selectedId === article.articleId) {
        setSelectedId(undefined);
        setEditor(blankEditor);
        setMode("list");
      }
      await loadList();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to delete article.");
    } finally {
      setBusy(false);
    }
  }

  function update(field: keyof EditorValue, value: string): void {
    setEditor((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  const selectedArticle = articles.find((article) => article.articleId === selectedId);

  if (!apiUrl) return (
    <main className="admin-page">
      <SiteHeader />
      <section className="admin-login">
        <p className="eyebrow">Private publishing</p>
        <h1>Article publishing is not connected.</h1>
        <p>This static build has no approved Voyager API URL. No write endpoint is exposed.</p>
      </section>
    </main>
  );

  if (!authenticated) return (
    <main className="admin-page">
      <SiteHeader />
      <section className="admin-login">
        <p className="eyebrow">Private publishing</p>
        <h1>Article desk</h1>
        <p>Enter the Voyager article publishing credential. It is kept only in this page’s memory and is not saved by the site.</p>
        <form onSubmit={signIn}>
          <label htmlFor="admin-token">Publishing credential</label>
          <input id="admin-token" type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} required />
          <button className="button button-primary" disabled={busy}>Open article desk</button>
        </form>
        {notice ? <p className="admin-notice" role="alert">{notice}</p> : null}
      </section>
    </main>
  );

  return (
    <main className="admin-page">
      <header className="admin-bar">
        <a className="brand" href="/"><span className="brand-mark" aria-hidden="true">N</span><span className="brand-name">Netherwood <strong>Article Desk</strong></span></a>
        <div><a href="/articles" target="_blank" rel="noreferrer">View public articles</a><button type="button" onClick={() => { setAuthenticated(false); setToken(""); }}>Lock desk</button></div>
      </header>
      <div className="admin-workspace">
        <section className="admin-heading">
          <div><p className="eyebrow">Private publishing</p><h1>{mode === "list" ? "Articles" : selectedId ? "Edit article" : "New article"}</h1></div>
          {mode === "list" ? <button className="button button-primary" type="button" onClick={newArticle} disabled={busy}>New Article</button> : <button className="admin-back" type="button" onClick={() => setMode("list")} disabled={busy}>← Article list</button>}
        </section>
        {notice ? <p className="admin-notice" role="status">{notice}</p> : null}

        {mode === "list" ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Status</th><th>Category</th><th>Modified</th><th>Published</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{articles.map((article) => (
                <tr key={article.articleId}>
                  <td><strong>{article.title}</strong>{article.hasUnpublishedChanges ? <span className="draft-change">Unpublished changes</span> : null}</td>
                  <td><span className={`status-label status-${article.status.toLowerCase()}`}>{article.status}</span></td>
                  <td>{article.category}</td><td>{isoLabel(article.modifiedDate)}</td><td>{isoLabel(article.publishedDate)}</td>
                  <td><div className="admin-actions"><button disabled={busy} onClick={() => void editArticle(article.articleId)}>Edit</button><button disabled={busy} onClick={() => void editArticle(article.articleId, true)}>Preview</button>{article.status === "Published" ? <button disabled={busy} onClick={() => void changeStatus(article.articleId, "unpublish")}>Unpublish</button> : <button disabled={busy} onClick={() => void changeStatus(article.articleId, "publish")}>Publish</button>}{article.status !== "Published" && article.status !== "Archived" ? <button disabled={busy} onClick={() => void changeStatus(article.articleId, "archive")}>Archive</button> : null}{article.status !== "Published" ? <button className="danger-action" disabled={busy} onClick={() => void deleteArticle(article)}>Delete</button> : null}</div></td>
                </tr>
              ))}</tbody>
            </table>
            {articles.length === 0 ? <p className="admin-empty">No articles yet. Create the first draft when you are ready.</p> : null}
          </div>
        ) : null}

        {mode === "edit" ? (
          <form className="article-editor" onSubmit={(event) => { event.preventDefault(); void saveDraft(); }}>
            <div className="editor-fields">
              <label>Title<input value={editor.title} onChange={(event) => update("title", event.target.value)} />{fieldErrors.title ? <small>{fieldErrors.title}</small> : null}</label>
              <label>URL slug<div className="slug-input"><span>/articles/</span><input value={editor.slug} onChange={(event) => { setSlugTouched(true); update("slug", event.target.value); }} /></div>{fieldErrors.slug ? <small>{fieldErrors.slug}</small> : null}</label>
              <label>Summary<textarea className="summary-field" value={editor.summary} onChange={(event) => update("summary", event.target.value)} />{fieldErrors.summary ? <small>{fieldErrors.summary}</small> : null}</label>
              <label>SEO description <span>Optional; the summary is used when this is blank</span><textarea className="summary-field" maxLength={500} value={editor.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} />{fieldErrors.seoDescription ? <small>{fieldErrors.seoDescription}</small> : null}</label>
              <div className="editor-grid"><label>Category<input value={editor.category} onChange={(event) => update("category", event.target.value)} /></label><label>Author<input value={editor.author} onChange={(event) => update("author", event.target.value)} /></label></div>
              <label>Tags <span>Comma separated</span><input value={editor.tags} onChange={(event) => update("tags", event.target.value)} />{fieldErrors.tags ? <small>{fieldErrors.tags}</small> : null}</label>
              <label>Featured image <span>Optional relative path or HTTPS URL</span><input value={editor.featuredImage} onChange={(event) => update("featuredImage", event.target.value)} />{fieldErrors.featuredImage ? <small>{fieldErrors.featuredImage}</small> : null}</label>
              <label className="checkbox-field"><input type="checkbox" checked={editor.isFeatured} onChange={(event) => setEditor((current) => ({ ...current, isFeatured: event.target.checked }))} /><span>Feature this article on the Articles page</span></label>
            </div>
            <div className="content-editor">
              <div className="editor-tabs" aria-label="Editing mode"><button type="button" className="active">HTML</button></div>
              <label htmlFor="article-html">Article Content</label>
              <textarea id="article-html" spellCheck="false" value={editor.html} onChange={(event) => update("html", event.target.value)} />
              {fieldErrors.html ? <small>{fieldErrors.html}</small> : null}
            </div>
            <div className="editor-buttons"><button className="button" type="submit" disabled={busy}>Save Draft</button><button className="button" type="button" onClick={() => void preview()} disabled={busy}>Preview</button>{selectedArticle?.status === "Published" ? <button className="button" type="button" onClick={() => void changeStatus(selectedArticle.articleId, "unpublish")} disabled={busy}>Unpublish</button> : null}<button className="button button-primary" type="button" onClick={() => void publishEditor()} disabled={busy}>Publish</button></div>
          </form>
        ) : null}

        {mode === "preview" ? (
          <section className="admin-preview">
            <div className="preview-toolbar"><div><span>Private preview</span><strong>{editor.title || "Untitled article"}</strong></div><button type="button" onClick={() => setMode("edit")}>Return to editor</button></div>
            <header className="article-header"><div className="article-kicker"><span>{editor.category}</span><span>Draft preview</span></div><h1>{editor.title || "Untitled article"}</h1><p className="article-deck">{editor.summary}</p><div className="article-byline">By {editor.author}</div></header>
            <div className="article-layout"><aside className="article-rail"><span>Filed under</span><strong>{editor.category}</strong></aside><div className="article-content" dangerouslySetInnerHTML={{ __html: previewHtml }} /></div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
