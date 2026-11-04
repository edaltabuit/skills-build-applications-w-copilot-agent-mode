import { useCapabilityData } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const state = useCapabilityData<ActivityResponse>('/api/activities');

  return <section>
    <h2>Activities</h2>
    {state.status === 'loading' && <p role="status">Loading activities...</p>}
    {state.status === 'error' && <p role="alert">Unable to load activities: {state.message}</p>}
    {state.status === 'success' && (state.data.activities.length === 0
      ? <p>No activities yet.</p>
      : <div className="table-responsive"><table className="table"><thead><tr><th scope="col">Activity</th><th scope="col">Minutes</th><th scope="col">Points</th><th scope="col">Date</th></tr></thead><tbody>
        {state.data.activities.map((activity, index) => <tr key={activity._id ?? `${activity.type}-${index}`}><th scope="row">{activity.type}</th><td>{activity.minutes}</td><td>{activity.points}</td><td>{activity.occurredAt ? new Date(activity.occurredAt).toLocaleDateString() : 'Today'}</td></tr>)}
      </tbody></table></div>)}
  </section>;
}
