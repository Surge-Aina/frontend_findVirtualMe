import { useState } from "react";

export default function BlogBlock({ template, ...data }) {
  const posts = data.posts || [];
  const readMoreText = data.readMoreText || "Read More";

  const [openPost, setOpenPost] = useState(null);

  if (posts.length === 0) return null;

  const isDS = template === "dataScientist";
  const isAgent = template === "agent";
  const sectionClass = isDS ? "py-16 bg-slate-900" : isAgent ? "py-16" : "py-16 bg-white";
  const headingClass = isDS
    ? "text-3xl font-bold text-center text-white mb-12"
    : isAgent
      ? "text-3xl font-bold text-center text-[color:var(--agent-text)] mb-12"
      : "text-3xl font-bold text-center text-gray-900 mb-12";
  const cardClass = isDS
    ? "bg-slate-800/90 border border-white/10 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    : isAgent
      ? "agent-panel-alt rounded-[1.5rem] overflow-hidden hover:translate-y-[-2px] transition-transform"
    : "bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow";

  return (
    <section className={sectionClass}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={isAgent ? "agent-panel rounded-[1.75rem] p-6 md:p-8" : ""}>
        <h2 className={headingClass}>Blog</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <article
              key={post.id || post.slug || i}
              className={cardClass}
            >
              {post.image && (
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {post.category && (
                  <span
                    className={
                      isDS
                        ? "text-xs font-medium text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full"
                        : isAgent
                          ? "text-xs font-medium text-[color:var(--agent-accent)] bg-white/5 px-3 py-1 rounded-full border border-[color:var(--agent-border)]"
                        : "text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
                    }
                  >
                    {post.category}
                  </span>
                )}
                <h3 className={`text-lg font-bold mt-3 mb-2 ${isDS ? "text-white" : isAgent ? "text-[color:var(--agent-text)]" : "text-gray-900"}`}>{post.title}</h3>
                {post.excerpt && (
                  <p className={`text-sm mb-4 line-clamp-3 ${isDS ? "text-slate-400" : isAgent ? "text-[color:var(--agent-muted)]" : "text-gray-600"}`}>{post.excerpt}</p>
                )}
                <div className={`flex items-center justify-between text-sm ${isDS ? "text-slate-500" : isAgent ? "text-[color:var(--agent-muted)]" : "text-gray-500"}`}>
                  {post.publishDate && <span>{post.publishDate}</span>}
                  {post.readTime && <span>{post.readTime}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenPost(post)}
                  className={
                    isDS
                      ? "mt-4 text-emerald-400 font-medium hover:underline text-sm"
                      : isAgent
                        ? "mt-4 text-[color:var(--agent-accent)] font-medium hover:underline text-sm"
                      : "mt-4 text-blue-600 font-medium hover:underline text-sm"
                  }
                >
                  {readMoreText}
                </button>
              </div>
            </article>
          ))}
        </div>
        </div>
      </div>

      {openPost && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-post-title"
          onClick={() => setOpenPost(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-start gap-4">
              <h3 id="blog-post-title" className="text-xl font-bold text-gray-900 pr-4">
                {openPost.title}
              </h3>
              <button
                type="button"
                className="shrink-0 text-gray-500 hover:text-gray-800 text-2xl leading-none"
                onClick={() => setOpenPost(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              {openPost.image && (
                <img src={openPost.image} alt="" className="w-full rounded-lg mb-4 object-cover max-h-64" />
              )}
              {openPost.category && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {openPost.category}
                </span>
              )}
              {openPost.excerpt && <p className="text-gray-600 mt-4">{openPost.excerpt}</p>}
              {openPost.content && (
                <div className="mt-4 text-gray-800 whitespace-pre-wrap">{openPost.content}</div>
              )}
              {!openPost.content && !openPost.excerpt && (
                <p className="text-gray-500 italic mt-4">No additional content for this post.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
