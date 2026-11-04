import { useCapabilityData } from './CapabilityCard.js';

type WorkoutSuggestion = { _id?: string; title: string; focus: string; minutes: number; difficulty: string; reason: string };
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  const email = 'mona@example.com';
  const state = useCapabilityData<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent(email)}`);

  return <section>
    <h2>Workout suggestions</h2>
    {state.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
    {state.status === 'error' && <p role="alert">Unable to load workout suggestions: {state.message}</p>}
    {state.status === 'success' && (state.data.suggestions.length === 0
      ? <p>No workout suggestions yet.</p>
      : <ul className="list-group">
        {state.data.suggestions.map((workout, index) => <li className="list-group-item" key={workout._id ?? `${workout.title}-${index}`}>
          <h3 className="h5">{workout.title}</h3><p>{workout.focus} · {workout.minutes} min · {workout.difficulty}</p><p>{workout.reason}</p>
        </li>)}
      </ul>)}
  </section>;
}
