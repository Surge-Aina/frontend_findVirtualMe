import { useEffect } from "react";

export default function SeoBlock({ template, ...data }) {
  useEffect(() => {
    if (data.siteTitle) {
      document.title = data.siteTitle;
    }

    const setMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", data.metaDescription);
    setMeta("keywords", data.keywords);
  }, [data.siteTitle, data.metaDescription, data.keywords]);

  return null;
}
