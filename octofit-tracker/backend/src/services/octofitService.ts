import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string) {
  return Object.assign(new Error(message), { status: 404 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function focusForActivity(type: string) {
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    running: 'endurance',
    cycle: 'endurance',
    cycling: 'endurance',
    walk: 'endurance',
    walking: 'endurance',
    strength: 'strength',
    yoga: 'mobility',
    stretching: 'mobility',
  };
  const normalizedType = type.trim().toLowerCase();
  return activityFocus[normalizedType] ?? normalizedType;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw badRequest('Activity details are required');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || typeof teamId !== 'string' || typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw badRequest('A valid user, team, activity type, and positive duration are required');
  }
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw badRequest('User and team IDs must be valid');
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw notFound('The selected user or team does not exist');
  return Activity.create({ user: user._id, team: team._id, type: type.trim(), minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw badRequest('Team details are required');
  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || !name.trim()) throw badRequest('A team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw badRequest('A team mascot is required');
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !mongoose.isValidObjectId(member))) {
    throw badRequest('Team members must be valid user IDs');
  }
  const users = members.length ? await User.find({ _id: { $in: members } }) : [];
  if (users.length !== new Set(members).size) throw notFound('One or more team members do not exist');
  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: users.map((user) => user._id) });
  if (users.length) await User.updateMany({ _id: { $in: users.map((user) => user._id) } }, { $set: { team: team._id } });
  return team;
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw notFound('No user was found for that email');
  const [recentActivities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
    Workout.find().lean(),
  ]);
  if (!workouts.length) return [];

  const goal = user.fitnessGoal?.trim().toLowerCase();
  const recentFocus = recentActivities[0] ? focusForActivity(recentActivities[0].type) : undefined;
  const focus = workouts.some((workout) => workout.focus.toLowerCase() === goal)
    ? goal
    : workouts.some((workout) => workout.focus.toLowerCase() === recentFocus)
      ? recentFocus
      : workouts[0].focus.toLowerCase();
  const activityReason = recentActivities[0] ? `your recent ${recentActivities[0].type} activity` : 'your training profile';
  return workouts
    .sort((left, right) => Number(right.focus.toLowerCase() === focus) - Number(left.focus.toLowerCase() === focus) || left.title.localeCompare(right.title))
    .map((workout) => ({
      ...workout,
      reason: workout.focus.toLowerCase() === focus
        ? `Recommended for your ${goal === focus ? `${goal} goal` : `${focus} focus`} and ${activityReason}.`
        : `Complements ${activityReason}.`,
    }));
}

export { User };
