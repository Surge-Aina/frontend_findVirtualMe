import { useMemo, useState } from "react";
import { SETUP_FLOW, buildApiRequest, listOperations, readPath, serverUrlOf } from "./specDocument";

export default function TryItPanel({ spec }) {
  const operations = useMemo(() => listOperations(spec), [spec]);
  const [apiKey, setApiKey] = useState("");
  const [index, setIndex] = useState(0);
  const [params, setParams] = useState({});
  const [bodyText, setBodyText] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [flowError, setFlowError] = useState("");
  const operation = operations[index] || null;
  const production = Boolean(import.meta.env.PROD);
  const pathParams = (operation?.parameters || []).filter((parameter) => parameter.in === "path");
  const queryParams = (operation?.parameters || []).filter((parameter) => parameter.in === "query");

  const send = async (event) => {
    event.preventDefault();
    if (!operation) return;
    setPending(true);
    setError("");
    setResult(null);
    try {
      const pathValues = {};
      const query = {};
      for (const parameter of pathParams) pathValues[parameter.name] = params[parameter.name] || "";
      for (const parameter of queryParams) query[parameter.name] = params[parameter.name] || "";
      const request = buildApiRequest({
        serverUrl: serverUrlOf(spec),
        method: operation.method,
        path: operation.path,
        pathParams: pathValues,
        query,
        bodyText,
        apiKey,
        production,
      });
      const response = await fetch(request.url, request.init);
      const text = await response.text();
      setResult({ status: response.status, body: text.slice(0, 8000) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The call failed.");
    } finally {
      setPending(false);
    }
  };

  const runFlow = async () => {
    setRunning(true);
    setFlowError("");
    const saved = {};
    const entries = [];
    try {
      for (const step of SETUP_FLOW.steps) {
        let path = step.path;
        for (const [name, value] of Object.entries(saved)) {
          path = path.replaceAll(`{${name}}`, encodeURIComponent(String(value)));
        }
        const request = buildApiRequest({
          serverUrl: serverUrlOf(spec),
          method: step.method,
          path,
          bodyText: step.bodyText,
          apiKey,
          production,
        });
        const response = await fetch(request.url, request.init);
        const text = await response.text();
        entries.push({ id: step.id, summary: step.summary, status: response.status, body: text.slice(0, 2000) });
        if (!response.ok) break;
        if (step.save) {
          let parsed = null;
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = null;
          }
          for (const [name, pointer] of Object.entries(step.save)) {
            const value = readPath(parsed, pointer);
            if (value !== undefined && value !== null) saved[name] = value;
          }
        }
      }
      setLog(entries);
    } catch (err) {
      setFlowError(err instanceof Error ? err.message : "The flow stopped.");
      setLog(entries);
    } finally {
      setRunning(false);
    }
  };

  if (!operation) {
    return <p className="text-sm text-slate-500">The OpenAPI document has no operations to call.</p>;
  }

  return (
    <div className="space-y-8">
      <form className="space-y-4" onSubmit={send}>
        <label className="block text-sm font-medium text-gray-700" htmlFor="reference-api-key">
          API key
          <input
            id="reference-api-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="fvm_..."
            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700" htmlFor="try-operation">
          Operation
        </label>
        <select
          id="try-operation"
          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900"
          value={String(index)}
          onChange={(event) => {
            setIndex(Number(event.target.value));
            setParams({});
            setBodyText("");
            setResult(null);
          }}
        >
          {operations.map((item, itemIndex) => (
            <option key={`${item.method} ${item.path}`} value={itemIndex}>
              {item.method} {item.path}
            </option>
          ))}
        </select>
        {pathParams.concat(queryParams).map((parameter) => (
          <label key={`${parameter.in}-${parameter.name}`} className="block text-sm text-gray-700">
            {parameter.name}
            <span className="text-slate-500"> · {parameter.in}</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900"
              value={params[parameter.name] || ""}
              onChange={(event) => setParams((current) => ({ ...current, [parameter.name]: event.target.value }))}
            />
          </label>
        ))}
        {operation.bodyProperties.length ? (
          <label className="block text-sm text-gray-700" htmlFor="try-body">
            JSON body
            <textarea
              id="try-body"
              rows={6}
              value={bodyText}
              onChange={(event) => setBodyText(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 font-mono text-sm text-gray-900"
            />
          </label>
        ) : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {pending ? "Sending..." : "Send"}
        </button>
        {result ? (
          <div className="rounded-lg border border-gray-200 bg-slate-900 text-slate-100 p-4">
            <div className="text-xs mb-2">HTTP {result.status}</div>
            <pre className="text-xs whitespace-pre-wrap break-all">{result.body || "(empty)"}</pre>
          </div>
        ) : null}
      </form>

      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-800">Chained flow</h3>
        <p className="text-sm text-slate-600">
          Create a key on the API Keys page, paste it above, then run these steps in order: list sites, subscribe a
          webhook, then send a test. The same in-memory key is used. It is not written to storage.
        </p>
        <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
          {SETUP_FLOW.steps.map((step) => (
            <li key={step.id}>
              <span className="font-mono">
                {step.method} {step.path}
              </span>{" "}
              — {step.summary}
            </li>
          ))}
        </ol>
        {flowError ? <p className="text-sm text-red-500">{flowError}</p> : null}
        <button
          type="button"
          onClick={runFlow}
          disabled={running || !apiKey}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {running ? "Running..." : "Run flow"}
        </button>
        {log.map((entry) => (
          <article key={entry.id} className="rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-slate-800">
              {entry.summary} · HTTP {entry.status}
            </div>
            <pre className="mt-2 text-xs whitespace-pre-wrap break-all text-slate-700">{entry.body}</pre>
          </article>
        ))}
      </div>
    </div>
  );
}
