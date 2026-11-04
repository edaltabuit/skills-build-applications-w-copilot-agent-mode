import { useCapabilityData } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot: string; members: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const state = useCapabilityData<TeamResponse>('/api/teams');

  return <section>
    <h2>Teams</h2>
    {state.status === 'loading' && <p role="status">Loading teams...</p>}
    {state.status === 'error' && <p role="alert">Unable to load teams: {state.message}</p>}
    {state.status === 'success' && (state.data.teams.length === 0
      ? <p>No teams yet.</p>
      : <div className="table-responsive"><table className="table"><thead><tr><th scope="col">Team</th><th scope="col">Mascot</th><th scope="col">Members</th></tr></thead><tbody>
        {state.data.teams.map((team, index) => <tr key={team._id ?? `${team.name}-${index}`}><th scope="row">{team.name}</th><td>{team.mascot}</td><td>{team.members?.length ?? 0}</td></tr>)}
      </tbody></table></div>)}
  </section>;
}
