import {
  FaGripVertical,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
} from "react-icons/fa";
import { BLOCK_LABELS } from "./portfolioEditorConfig";

/** Legacy sections rail (main branch) when VITE_EDITOR_NAVIGATOR_ENABLED is off. */
export function SectionsStructurePanel({
  sections,
  activeIdx,
  onActivateSection,
  handleMoveSection,
  handleSectionVisibilityChange,
  addableBlocks,
  addingSectionType,
  setAddingSectionType,
  handleAddSection,
  addingSection,
  saveDisabled,
}) {
  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Sections</h3>
        </div>
        <nav className="p-2 space-y-1">
          {sections.map((section, idx) => (
            <div
              key={section._id || idx}
              className={`flex items-stretch rounded-lg border border-transparent ${
                activeIdx === idx
                  ? "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900"
                  : "hover:bg-gray-50 dark:hover:bg-neutral-800/80"
              }`}
            >
              <div className="flex flex-col justify-center px-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveSection(idx, -1)}
                  disabled={idx === 0 || saveDisabled}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 disabled:opacity-30"
                  title="Move up"
                >
                  <FaArrowUp className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveSection(idx, 1)}
                  disabled={idx === sections.length - 1 || saveDisabled}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 disabled:opacity-30"
                  title="Move down"
                >
                  <FaArrowDown className="text-xs" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onActivateSection(idx)}
                className={`flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors rounded-lg ${
                  activeIdx === idx
                    ? "text-blue-700 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-neutral-300"
                }`}
              >
                <FaGripVertical className="text-gray-400 text-xs shrink-0" />
                <span className="truncate">{BLOCK_LABELS[section.type] || section.type}</span>
              </button>
              <label
                className="flex items-center px-2 shrink-0 cursor-pointer"
                title="Show on portfolio when saved"
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
                />
              </label>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-4 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-neutral-100 text-sm">Structure</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
          Add a supported block type. Existing section types are hidden from the list to keep
          navigation predictable.
        </p>
        <select
          value={addingSectionType}
          onChange={(e) => setAddingSectionType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-neutral-100 shadow-sm [color-scheme:light] dark:[color-scheme:dark] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={!addableBlocks.length || saveDisabled}
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
          disabled={!addingSectionType || !addableBlocks.length || saveDisabled}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <FaPlus /> {addingSection ? "Adding..." : "Add section"}
        </button>
      </div>
    </>
  );
}