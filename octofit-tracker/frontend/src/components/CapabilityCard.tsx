type Props = { title: string; description: string };
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export type CapabilityState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export function useCapabilityData<T>(path: string): CapabilityState<T> {
  const [state, setState] = useState<CapabilityState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<T>(path)
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      });
    return () => { active = false; };
  }, [path]);

  return state;
}
