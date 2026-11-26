import {
  draftContentEquals,
  draftMetaFromDetail,
  mergeDraftMutationPortfolio,
} from "../portfolioDraftEditor";

const published = {
  _id: "pub-1",
  template: "agent",
  owner: "owner-1",
  title: "Live title",
  sections: [{ _id: "s1", type: "hero", order: 0, visible: true, data: { title: "H" } }],
  themeId: "aurora",
  layoutMode: "stacked",
};

const partialDraftResponse = {
  _id: "pub-1",
  title: "Live title",
  sections: published.sections,
  draftMode: true,
};

describe("mergeDraftMutationPortfolio", () => {
  it("preserves template, owner, and other live-only fields", () => {
    const merged = mergeDraftMutationPortfolio(published, {
      ...partialDraftResponse,
      title: "Draft title",
    });
    expect(merged.template).toBe("agent");
    expect(merged.owner).toBe("owner-1");
    expect(merged.title).toBe("Draft title");
  });
});

describe("draftMetaFromDetail", () => {
  it("does not mark unpublished when draft is approved and matches published", () => {
    const { _id, template, owner, ...editable } = published;
    const meta = draftMetaFromDetail({
      published,
      draft: {
        ...editable,
        approvalState: "approved",
        source: "owner",
      },
      hasDraft: true,
    });
    expect(meta.hasUnpublishedDraft).toBe(false);
    expect(draftContentEquals(published, editable)).toBe(true);
  });

  it("marks unpublished when approval is pending even if content matches", () => {
    const meta = draftMetaFromDetail({
      published,
      draft: {
        title: "Live title",
        sections: published.sections,
        approvalState: "pending_owner",
        source: "ai",
      },
      hasDraft: true,
    });
    expect(meta.hasUnpublishedDraft).toBe(true);
    expect(meta.source).toBe("ai");
  });

  it("marks unpublished when approved but content differs", () => {
    const meta = draftMetaFromDetail({
      published,
      draft: {
        title: "Different draft",
        sections: published.sections,
        approvalState: "approved",
        source: "owner",
      },
      hasDraft: true,
    });
    expect(meta.hasUnpublishedDraft).toBe(true);
  });
});