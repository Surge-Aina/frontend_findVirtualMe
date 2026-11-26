import BLOCK_COMPONENTS from "../blocks";
import { blockDataFromPuckRenderProps } from "./featureComponentAdapters";

/**
 * Merges owner GET /api/portfolios/components config with client render() functions.
 * Backend ships ComponentConfig minus render; Puck requires render at runtime.
 */
export function buildPuckEditorConfig(serializableConfig, template) {
  if (!serializableConfig) {
    return { root: { fields: {} }, components: {} };
  }

  const components = {};
  const source = serializableConfig.components || {};
  for (const [type, definition] of Object.entries(source)) {
    const blockType = definition?.metadata?.blockType;
    const Block = blockType ? BLOCK_COMPONENTS[blockType] : null;
    components[type] = {
      ...definition,
      render: (props) => {
        if (!Block) return null;
        const blockData = blockDataFromPuckRenderProps(type, props, template);
        return <Block template={template} {...blockData} />;
      },
    };
  }

  return {
    root: serializableConfig.root ? { ...serializableConfig.root, render: () => null } : { fields: {} },
    components,
  };
}