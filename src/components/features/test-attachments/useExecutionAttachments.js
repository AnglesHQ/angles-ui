import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

// Whether an execution references any attachment, at execution level or on a step. Steps
// of a manual execution can carry manual-testing attachments too; those are not returned
// by the listing below and are simply not shown here.
export const hasAttachmentReferences = (execution) => (
  (execution.attachments || []).length > 0
  || (execution.actions || []).some((action) => (action.steps || [])
    .some((step) => (step.attachments || []).length > 0))
);

/*
 * Loads the metadata (kind, name, size) of the files an automated execution uploaded.
 *
 * The execution only carries attachment ids, so the metadata is fetched once, the first
 * time the execution is expanded, rather than for every execution on the page. Returns
 * { status: 'idle' | 'loading' | 'loaded' | 'error', byId }.
 */
const useExecutionAttachments = (execution, enabled) => {
  const [state, setState] = useState({ status: 'idle', byId: {} });
  // Which execution has been requested. A ref rather than state, so starting the request
  // does not re-run the effect (whose clean-up would discard the response).
  const requested = useRef(undefined);
  const wanted = enabled && hasAttachmentReferences(execution);

  useEffect(() => {
    if (!wanted || requested.current === execution._id) return undefined;
    requested.current = execution._id;
    let cancelled = false;
    let finished = false;
    setState({ status: 'loading', byId: {} });
    axios.get('attachment', { params: { executionId: execution._id } })
      .then((response) => {
        finished = true;
        if (cancelled) return;
        const byId = {};
        (response.data.attachments || []).forEach((attachment) => {
          byId[attachment._id] = attachment;
        });
        setState({ status: 'loaded', byId });
      })
      .catch(() => {
        finished = true;
        if (!cancelled) setState({ status: 'error', byId: {} });
      });
    return () => {
      cancelled = true;
      // Collapsed (or unmounted) before the response arrived: request again next time.
      // Once it has arrived, the result is kept and collapsing does not refetch.
      if (!finished) requested.current = undefined;
    };
  }, [wanted, execution._id]);

  return state;
};

export default useExecutionAttachments;
