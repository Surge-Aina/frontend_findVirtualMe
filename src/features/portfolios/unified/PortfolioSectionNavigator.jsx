import { useState } from "react";
import {
  FaGripVertical,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaTrash,
  FaPen,
} from "react-icons/fa";
import { BLOCK_LABELS } from "./portfolioEditorConfig";
import {
  MAX_PORTFOLIO_SECTIONS,
  MAX_EDITOR_DISPLAY_LABEL_LENGTH,
  getSectionDisplayLabel,
  getSectionTypeHint,
  normalizeEditorDisplayLabel,
  SECTION_DISPLAY_LABEL_KEY,
} from "./portfolioEditorSections";

export function PortfolioSectionNavigator({
  sections,
  activeIdx,
  onActivateSection,
  handleMoveSection,
  handleDragReorder,
  handleSectionVisibilityChange,
  onRenameSection,
  onRemoveSection,
  addableBlocks,
  addingSectionType,
  setAddingSectionType,
  handleAddSection,
  addingSection,
  saveDisabled,
}) {
  const [dragFromIdx, setDragFromIdx] = useState(null);
  const [labelEditId, setLabelEditId] = useState(null);
  const [labelDraft, setLabelDraft] = useState("");

  const atSectionCap = sections.length >= MAX_PORTFOLIO_SECTIONS;

  const startLabelEdit = (section) => {
    setLabelEditId(section._id);
    setLabelDraft(section.data?.[SECTION_DISPLAY_LABEL_KEY] || "");
  };

  const commitLabelEdit = (sectionId) => {
    onRenameSection(sectionId, normalizeEditorDisplayLabel(labelDraft));
    setLabelEditId(null);
    setLabelDraft("");
  };

  const cancelLabelEdit = () => {
    setLabelEditId(null);
    setLabelDraft("");
  };

  const onDragStart = (idx) => {
    if (saveDisabled) return;
    setDragFromIdx(idx);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const onDrop = (dropIdx) => {
    if (dragFromIdx == null || dragFromIdx === dropIdx) {
      setDragFromIdx(null);
      return;
    }
    handleDragReorder(dragFromIdx, dropIdx);
    setDragFromIdx(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Pages &amp; sections</h3>
          <span className="text-xs text-gray-500 dark:text-neutral-400 tabular-nums">
            {sections.length}/{MAX_PORTFOLIO_SECTIONS}
          </span>
        </div>
        <nav className="p-2 space-y-1" aria-label="Portfolio sections">
          {sections.map((section, idx) => {
            const isActive = activeIdx === idx;
            const displayLabel = getSectionDisplayLabel(section);
            const typeHint = getSectionTypeHint(section);
            const isEditingLabel = labelEditId === section._id;

            return (
              <div
                key={section._id || idx}
                draggable={!saveDisabled && Boolean(section._id)}
                onDragStart={() => onDragStart(idx)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(idx)}
                className={`flex items-stretch rounded-lg border ${
                  dragFromIdx === idx ? "opacity-60" : ""
                } ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-neutral-800/80"
                }`}
              >
                <div className="flex flex-col justify-center px-1.5 gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveSection(idx, -1)}
                    disabled={idx === 0 || saveDisabled}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 disabled:opacity-30"
                    title="Move up"
                    aria-label="Move section up"
                  >
                    <FaArrowUp className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(idx, 1)}
                    disabled={idx === sections.length - 1 || saveDisabled}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 disabled:opacity-30"
                    title="Move down"
                    aria-label="Move section down"
                  >
                    <FaArrowDown className="text-xs" />
                  </button>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1 py-2 pl-1 pr-2">
                  {isEditingLabel ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        className="w-full min-w-0 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm text-gray-900 dark:text-neutral-100"
                        value={labelDraft}
                        maxLength={MAX_EDITOR_DISPLAY_LABEL_LENGTH}
                        onChange={(e) => setLabelDraft(e.target.value)}
                        placeholder={BLOCK_LABELS[section.type] || section.type}
                        aria-label="Section display label"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitLabelEdit(section._id);
                          if (e.key === "Escape") cancelLabelEdit();
                        }}
                      />
                      <button
                        type="button"
                        className="text-xs text-blue-600 dark:text-blue-400 px-1"
                        onClick={() => commitLabelEdit(section._id)}
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onActivateSection(idx)}
                      className={`flex items-center gap-2 text-left text-sm transition-colors w-full ${
                        isActive
                          ? "text-blue-700 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-neutral-300"
                      }`}
                    >
                      <FaGripVertical
                        className="text-gray-400 text-xs shrink-0 cursor-grab active:cursor-grabbing"
                        title="Drag to reorder"
                      />
                      <span className="truncate">{displayLabel}</span>
                      {section.visible === false ? (
                        <span className="text-[10px] uppercase tracking-wide text-gray-400 shrink-0">
                          Hidden
                        </span>
                      ) : null}
                    </button>
                  )}
                  {typeHint ? (
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500 pl-5 truncate">
                      {typeHint}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col justify-center items-center gap-1 px-1 shrink-0">
                  <label
                    className="flex items-center px-1 cursor-pointer"
                    title="Show on live site when published"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-blue-600 focus:ring-blue-500"
                      checked={section.visible !== false}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (section._id) handleSectionVisibilityChange(section._id, e.target.checked);
                      }}
                      aria-label={`Toggle visibility for ${displayLabel}`}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => startLabelEdit(section)}
                    disabled={saveDisabled}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 disabled:opacity-30 p-1"
                    title="Rename display label"
                    aria-label={`Rename ${displayLabel}`}
                  >
                    <FaPen className="text-[10px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => section._id && onRemoveSection(section._id)}
                    disabled={saveDisabled || !section._id}
                    className="text-red-300 hover:text-red-600 disabled:opacity-30 p-1"
                    title="Remove section"
                    aria-label={`Remove ${displayLabel}`}
                  >
                    <FaTrash className="text-[10px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-4 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-neutral-100 text-sm">Add section</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
          Pick a block type allowed for this template. Types already on the site are hidden. Drag
          rows or use arrows to reorder.
        </p>
        {atSectionCap ? (
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-lg px-3 py-2">
            This site already has the maximum of {MAX_PORTFOLIO_SECTIONS} sections.
          </p>
        ) : null}
        <select
          value={addingSectionType}
          onChange={(e) => setAddingSectionType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-neutral-100 shadow-sm [color-scheme:light] dark:[color-scheme:dark] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={!addableBlocks.length || saveDisabled || atSectionCap}
          aria-label="Section type to add"
        >
          {addableBlocks.length === 0 ? (
            <option value="">All supported blocks are already in use</option>
          ) : (
            addableBlocks.map((block) => (
              <option key={block.type} value={block.type}>
                {block.label || BLOCK_LABELS[block.type] || block.type}
              </option>
            ))
          )}
        </select>
        <button
          type="button"
          onClick={handleAddSection}
          disabled={!addingSectionType || !addableBlocks.length || saveDisabled || atSectionCap}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <FaPlus /> {addingSection ? "Adding..." : "Add section"}
        </button>
      </div>
    </>
  );
}