import { mergeFeatureComponentOrder, pickFeatureContentDiff } from "../puckPortfolioSync";

describe("puckPortfolioSync", () => {
  const sections = [
    { _id: "hero", type: "hero", order: 0 },
    { _id: "c1", type: "contact", order: 1 },
    { _id: "g1", type: "gallery", order: 2 },
  ];

  it("merges puck component order into full section ids", () => {
    const puckContent = [
      { type: "Gallery", props: { id: "g1" } },
      { type: "ContactLeadForm", props: { id: "c1" } },
    ];
    expect(mergeFeatureComponentOrder(sections, puckContent)).toEqual(["hero", "g1", "c1"]);
  });

  it("detects add, remove, update, and reorder diffs", () => {
    const prev = [{ type: "ContactLeadForm", props: { id: "c1", headline: "A" } }];
    const reordered = [{ type: "ContactLeadForm", props: { id: "c1", headline: "B" } }];
    const updated = pickFeatureContentDiff(prev, reordered);
    expect(updated.updated).toHaveLength(1);

    const removed = pickFeatureContentDiff(prev, []);
    expect(removed.removedIds).toEqual(["c1"]);

    const added = pickFeatureContentDiff(
      prev,
      [
        ...prev,
        { type: "Gallery", props: { id: "g1", title: "Photos" } },
      ]
    );
    expect(added.added).toHaveLength(1);
  });
});