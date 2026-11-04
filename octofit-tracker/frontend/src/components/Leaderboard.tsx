import { useCapabilityData } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const state = useCapabilityData<LeaderboardResponse>('/api/leaderboard');

  return <section>
    <h2>Leaderboard</h2>
    {state.status === 'loading' && <p role="status">Loading leaderboard...</p>}
    {state.status === 'error' && <p role="alert">Unable to load leaderboard: {state.message}</p>}
    {state.status === 'success' && (state.data.leaderboard.length === 0
      ? <p>No rankings yet.</p>
      : <div className="table-responsive"><table className="table"><thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead><tbody>
        {state.data.leaderboard.map((entry) => <tr key={entry.rank}><th scope="row">{entry.rank}</th><td>{entry.teamName}</td><td>{entry.totalPoints}</td></tr>)}
      </tbody></table></div>)}
  </section>;
}
