import { useCallback, useEffect, useMemo, useRef } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { puckTypeForBlockType } from "./puckBlockTypeMap";
import {
  puckPropsToSectionData,
  sectionDataToPuckProps,
} from "./featureComponentAdapters";

const PERSIST_DEBOUNCE_MS = 450;

/**
 * Puck Fields + Preview for a single feature section (lazy-loaded).
 */
export function PuckFeatureSectionEditor({
  section,
  template,
  puckConfig,
  onPersistSection,
  persistDisabled = false,
}) {
  const puckType = puckTypeForBlockType(section.type);
  const timerRef = useRef(null);
  const lastEmittedRef = useRef("");

  const data = useMemo(
    () => ({
      content: [
        {
          type: puckType,
          props: {
            id: section._id,
            ...sectionDataToPuckProps(puckType, section.data || {}, template),
          },
        },
      ],
      root: { props: {} },
      zones: {},
    }),
    [section._id, section.data, puckType, template]
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const schedulePersist = useCallback(
    (nextProps) => {
      const payload = puckPropsToSectionData(puckType, nextProps, template, section.data || {});
      const signature = JSON.stringify(payload);
      if (signature === lastEmittedRef.current) return;
      lastEmittedRef.current = signature;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!persistDisabled) {
          onPersistSection(payload);
        }
      }, PERSIST_DEBOUNCE_MS);
    },
    [onPersistSection, persistDisabled, puckType, template, section.data]
  );

  const handleChange = useCallback(
    (nextData) => {
      const item = nextData?.content?.[0];
      if (!item?.props) return;
      schedulePersist(item.props);
    },
    [schedulePersist]
  );

  if (!puckType || !puckConfig) return null;

  return (
    <div className="puck-feature-section-editor rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
      <Puck
        config={puckConfig}
        data={data}
        onChange={handleChange}
        permissions={{ drag: false, insert: false, delete: false, duplicate: false }}
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 min-h-[320px]">
          <div className="border-b xl:border-b-0 xl:border-r border-gray-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-900">
            <p className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-3">
              Component fields (Puck)
            </p>
            <Puck.Fields wrapFields />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-neutral-950/80">
            <p className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-3">
              Preview
            </p>
            <Puck.Preview />
          </div>
        </div>
      </Puck>
    </div>
  );
}