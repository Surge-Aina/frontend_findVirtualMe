import { blockTypeForPuckType, puckPropsToSectionData } from "./puckBlockTypeMap";

function contentIds(content) {
  return (content || []).map((item) => String(item?.props?.id || "")).filter(Boolean);
}

function contentOrderKey(content) {
  return contentIds(content).join(",");
}

/**
 * Merge Puck feature-component order into the full portfolio section id list.
 */
export function mergeFeatureComponentOrder(allSections, puckContent) {
  const orderedSections = [...(allSections || [])].sort((a, b) => a.order - b.order);
  const componentIdSet = new Set(contentIds(puckContent));
  const componentOrder = contentIds(puckContent);
  let componentIndex = 0;
  return orderedSections.map((section) => {
    const sectionId = String(section._id || "");
    if (componentIdSet.has(sectionId)) {
      const nextId = componentOrder[componentIndex];
      componentIndex += 1;
      return nextId;
    }
    return sectionId;
  });
}

export function pickFeatureContentDiff(prevContent, nextContent) {
  const prevIds = new Set(contentIds(prevContent));
  const nextIds = new Set(contentIds(nextContent));

  const added = (nextContent || []).filter((item) => {
    const id = item?.props?.id;
    return !id || !prevIds.has(String(id));
  });

  const removedIds = [...prevIds].filter((id) => !nextIds.has(id));

  const updated = [];
  for (const item of nextContent || []) {
    const id = item?.props?.id;
    if (!id) continue;
    const prevItem = (prevContent || []).find((c) => String(c.props?.id) === String(id));
    if (!prevItem) continue;
    const prevProps = JSON.stringify(puckPropsToSectionData(prevItem.props));
    const nextProps = JSON.stringify(puckPropsToSectionData(item.props));
    if (prevProps !== nextProps) {
      updated.push(item);
    }
  }

  return {
    added,
    removedIds,
    updated,
    orderChanged: contentOrderKey(prevContent) !== contentOrderKey(nextContent),
  };
}

export function defaultPropsForPuckType(puckType, config) {
  return config?.components?.[puckType]?.defaultProps
    ? JSON.parse(JSON.stringify(config.components[puckType].defaultProps))
    : {};
}

export function blockTypeForPuckItem(item, config) {
  return blockTypeForPuckType(item?.type, config);
}