import React from "react";
import { diffWords } from "diff";

export function HighlightedDiff({
  oldText,
  newText,
}: {
  oldText?: string | null;
  newText?: string | null;
}) {
  if (!oldText && !newText) return null;

  // If only new text exists (CREATE operation)
  if (!oldText && newText) {
    return <div className="text-green-600">{newText}</div>;
  }

  // If only old text exists (DELETE operation)
  if (oldText && !newText) {
    return <div className="text-red-600 line-through">{oldText}</div>;
  }

  // If both exist, show diff
  if (oldText && newText) {
    const diff = diffWords(oldText, newText);

    return (
      <div className="space-y-2">
        <div className="font-medium text-sm text-gray-600 mb-1">Changes:</div>
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          {diff.map((part, index) => {
            if (part.added) {
              return (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-1 rounded"
                >
                  {part.value}
                </span>
              );
            }
            if (part.removed) {
              return (
                <span
                  key={index}
                  className="bg-red-100 text-red-800 px-1 rounded line-through"
                >
                  {part.value}
                </span>
              );
            }
            return <span key={index}>{part.value}</span>;
          })}
        </div>
      </div>
    );
  }

  return null;
}

export function JsonDiff({
  oldJson,
  newJson,
}: {
  oldJson?: any;
  newJson?: any;
}) {
  const oldStr = oldJson ? JSON.stringify(oldJson, null, 2) : "";
  const newStr = newJson ? JSON.stringify(newJson, null, 2) : "";

  if (!oldJson && !newJson) {
    return null;
  }

  if (oldStr === newStr) {
    return (
      <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-96 overflow-y-auto">
        <pre className="text-xs font-mono whitespace-pre-wrap break-words">
          {newStr}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {oldJson && (
        <details className="group">
          <summary className="cursor-pointer text-red-600 text-sm font-medium hover:text-red-700">
            Old Value
          </summary>
          <div className="mt-1 p-3 bg-red-50 rounded border border-red-200 max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {oldStr}
            </pre>
          </div>
        </details>
      )}
      {newJson && (
        <details className="group" open={!oldJson}>
          <summary className="cursor-pointer text-green-600 text-sm font-medium hover:text-green-700">
            New Value
          </summary>
          <div className="mt-1 p-3 bg-green-50 rounded border border-green-200 max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {newStr}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
