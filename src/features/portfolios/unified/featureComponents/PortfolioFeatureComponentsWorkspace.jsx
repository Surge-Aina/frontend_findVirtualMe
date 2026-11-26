import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { toast } from "react-toastify";
import { portfolioApi } from "@/shared/api/portfolioApi";
import { FEATURE_COMPONENT_VIEWPORTS } from "./featureComponentViewports";
import {
  blockTypeForPuckItem,
  defaultPropsForPuckType,
  mergeFeatureComponentOrder,
  pickFeatureContentDiff,
} from "./puckPortfolioSync";
import { formatApprovalState, formatDraftSourceLabel } from "../portfolioDraftEditor";
import { puckPropsToSectionData } from "./puckBlockTypeMap";

function mergePreservedSectionData(existingData, puckProps) {
  const next = { ...(existingData || {}) };
  const puckOnly = puckPropsToSectionData(puckProps);
  return { ...next, ...puckOnly };
}

/**
 * Full Puck workspace: component drawer, reorder, field editing, and preview.
 */
export function PortfolioFeatureComponentsWorkspace({
  portfolioId,
  template,
  puckConfig,
  puckData,
  approvalState,
  source,
  sections,
  saveBeforeStructureChange,
  onPortfolioUpdate,
  busy = false,
  setBusy,
}) {
  const [localData, setLocalData] = useState(puckData);
  const syncingRef = useRef(false);
  const prevContentRef = useRef(puckData?.content || []);
  const propsSyncTimerRef = useRef(null);

  useEffect(() => {
    setLocalData(puckData);
    prevContentRef.current = puckData?.content || [];
  }, [puckData]);

  useEffect(
    () => () => {
      if (propsSyncTimerRef.current) clearTimeout(propsSyncTimerRef.current);
    },
    []
  );

  const approvalLabel = formatApprovalState(approvalState);
  const sourceLabel = formatDraftSourceLabel(source);
  const showPendingReview = approvalState === "pending_owner" && (source === "ai" || source === "api");

  const uiData = useMemo(
    () => ({
      content: localData?.content || [],
      root: localData?.root || { props: {} },
      zones: localData?.zones || {},
    }),
    [localData]
  );

  const applyServerPortfolio = useCallback(
    (responseData, currentSections) => {
      const nextPortfolio = responseData?.portfolio;
      if (!nextPortfolio) return;
      onPortfolioUpdate(nextPortfolio, currentSections);
      const refreshedContent = (nextPortfolio.sections || [])
        .map((section) => {
          const puckType = puckConfig?.components
            ? Object.entries(puckConfig.components).find(
                ([, def]) => def?.metadata?.blockType === section.type
              )?.[0]
            : null;
          if (!puckType) return null;
          return {
            type: puckType,
            props: { id: section._id, ...(section.data || {}) },
          };
        })
        .filter(Boolean);
      const next = {
        content: refreshedContent,
        root: puckData?.root || { props: { title: "" } },
        zones: {},
      };
      setLocalData(next);
      prevContentRef.current = next.content;
    },
    [onPortfolioUpdate, puckConfig?.components, puckData?.root]
  );

  const syncStructuralAndProps = useCallback(
    async (nextPuckData) => {
      if (!portfolioId || syncingRef.current) return;
      const prevContent = prevContentRef.current || [];
      const nextContent = nextPuckData?.content || [];
      const diff = pickFeatureContentDiff(prevContent, nextContent);

      if (
        !diff.added.length &&
        !diff.removedIds.length &&
        !diff.updated.length &&
        !diff.orderChanged
      ) {
        setLocalData(nextPuckData);
        prevContentRef.current = nextContent;
        return;
      }

      const propsOnly =
        !diff.added.length && !diff.removedIds.length && !diff.orderChanged && diff.updated.length;

      if (propsOnly) {
        setLocalData(nextPuckData);
        if (propsSyncTimerRef.current) clearTimeout(propsSyncTimerRef.current);
        propsSyncTimerRef.current = setTimeout(async () => {
          if (syncingRef.current) return;
          const pendingDiff = pickFeatureContentDiff(prevContentRef.current || [], nextContent);
          if (!pendingDiff.updated.length) return;
          syncingRef.current = true;
          setBusy?.(true);
          try {
            await saveBeforeStructureChange?.();
            let workingSections = [...(sections || [])];
            for (const item of pendingDiff.updated) {
              const sectionId = item.props?.id;
              if (!sectionId) continue;
              const existing = workingSections.find((s) => String(s._id) === String(sectionId));
              const merged = mergePreservedSectionData(existing?.data, item.props);
              const res = await portfolioApi.updateSection(portfolioId, sectionId, merged);
              applyServerPortfolio(res.data, workingSections);
              workingSections = res.data?.portfolio?.sections || workingSections;
            }
            prevContentRef.current = nextContent;
          } catch (err) {
            toast.error(err.response?.data?.error || "Could not save component fields");
          } finally {
            syncingRef.current = false;
            setBusy?.(false);
          }
        }, 450);
        return;
      }

      if (propsSyncTimerRef.current) clearTimeout(propsSyncTimerRef.current);

      syncingRef.current = true;
      setBusy?.(true);
      try {
        await saveBeforeStructureChange?.();

        let workingSections = [...(sections || [])];

        for (const removedId of diff.removedIds) {
          const res = await portfolioApi.removeSection(portfolioId, removedId);
          applyServerPortfolio(res.data, workingSections);
          workingSections = res.data?.portfolio?.sections || workingSections;
        }

        for (const item of diff.added) {
          const blockType = blockTypeForPuckItem(item, puckConfig);
          if (!blockType) continue;
          const data = {
            ...defaultPropsForPuckType(item.type, puckConfig),
            ...puckPropsToSectionData(item.props),
          };
          const order = workingSections.length;
          const res = await portfolioApi.addSection(portfolioId, blockType, data, order);
          applyServerPortfolio(res.data, workingSections);
          workingSections = res.data?.portfolio?.sections || workingSections;
        }

        for (const item of diff.updated) {
          const sectionId = item.props?.id;
          if (!sectionId) continue;
          const existing = workingSections.find((s) => String(s._id) === String(sectionId));
          const merged = mergePreservedSectionData(existing?.data, item.props);
          const res = await portfolioApi.updateSection(portfolioId, sectionId, merged);
          applyServerPortfolio(res.data, workingSections);
          workingSections = res.data?.portfolio?.sections || workingSections;
        }

        if (diff.orderChanged && nextContent.length) {
          const mergedIds = mergeFeatureComponentOrder(workingSections, nextContent);
          const res = await portfolioApi.reorderSections(portfolioId, mergedIds);
          applyServerPortfolio(res.data, workingSections);
        }

        setLocalData(nextPuckData);
        prevContentRef.current = nextContent;
      } catch (err) {
        toast.error(err.response?.data?.error || "Could not update feature components");
        setLocalData({
          content: prevContent,
          root: nextPuckData?.root || { props: {} },
          zones: {},
        });
      } finally {
        syncingRef.current = false;
        setBusy?.(false);
      }
    },
    [
      applyServerPortfolio,
      portfolioId,
      puckConfig,
      saveBeforeStructureChange,
      sections,
      setBusy,
    ]
  );

  const handleChange = useCallback(
    (nextData) => {
      void syncStructuralAndProps(nextData);
    },
    [syncStructuralAndProps]
  );

  if (!puckConfig) {
    return (
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        Feature component configuration is not available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showPendingReview ? (
        <div
          className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
          role="status"
        >
          <p className="font-medium">Review before publishing</p>
          <p className="text-xs mt-1 text-amber-800/90 dark:text-amber-200/90">
            Source: {sourceLabel}
            {approvalLabel ? ` · ${approvalLabel}` : ""}. Check these components, then use Publish when
            ready.
          </p>
        </div>
      ) : null}
      <div
        className={`rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900 ${
          busy ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <Puck
          config={puckConfig}
          data={uiData}
          onChange={handleChange}
          viewports={FEATURE_COMPONENT_VIEWPORTS}
          headerTitle="Feature components"
          metadata={{ template }}
        />
      </div>
    </div>
  );
}