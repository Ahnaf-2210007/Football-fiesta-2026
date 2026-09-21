'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { GroupStanding } from '@/types';
import { 
  Trophy, 
  Shuffle, 
  Calendar, 
  Edit3, 
  RotateCcw, 
  Lock, 
  CheckCircle2, 
  Award,
  Swords,
  X
} from 'lucide-react';

export default function TournamentPage() {
  const { 
    isAdmin, 
    teams, 
    fixtures, 
    performGroupDraw, 
    updateFixtureScore, 
    standingsOverrides, 
    updateStandingOverride, 
    resetStandingOverrides 
  } = useApp();

  const [isEditingStandings, setIsEditingStandings] = useState(false);
  const [showReshuffleModal, setShowReshuffleModal] = useState(false);

  // Group A and B teams
  const groupATeams = teams.filter(t => t.group === 'A');
  const groupBTeams = teams.filter(t => t.group === 'B');

  // Helper to calculate automated standings for a group
  const calculateStandings = (group: 'A' | 'B'): GroupStanding[] => {
    const groupTeams = teams.filter(t => t.group === group);
    const groupFixtures = fixtures.filter(f => f.group === group && f.isCompleted);

    const standingsMap: Record<string, GroupStanding> = {};

    groupTeams.forEach(t => {
      standingsMap[t.id] = {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        group,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    });

    groupFixtures.forEach(f => {
      const t1 = standingsMap[f.team1Id];
      const t2 = standingsMap[f.team2Id];
      const g1 = f.team1Score || 0;
      const g2 = f.team2Score || 0;

      if (t1 && t2) {
        t1.played += 1;
        t2.played += 1;
        t1.goalsFor += g1;
        t1.goalsAgainst += g2;
        t2.goalsFor += g2;
        t2.goalsAgainst += g1;

        if (g1 > g2) {
          t1.won += 1;
          t1.points += 3;
          t2.lost += 1;
        } else if (g2 > g1) {
          t2.won += 1;
          t2.points += 3;
          t1.lost += 1;
        } else {
          t1.drawn += 1;
          t1.points += 1;
          t2.drawn += 1;
          t2.points += 1;
        }

        t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
        t2.goalDifference = t2.goalsFor - t2.goalsAgainst;
      }
    });

    // Apply any manual overrides
    const result = Object.values(standingsMap).map(s => {
      const override = standingsOverrides[s.teamId];
      if (override) {
        return { ...s, ...override, manualOverride: true };
      }
      return s;
    });

    // Sort by Points, then Goal Difference, then Goals For
    return result.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const standingsA = calculateStandings('A');
  const standingsB = calculateStandings('B');

  // Determine Knockout Semi-final pairings
  const winnerA = standingsA[0];
  const runnerUpA = standingsA[1];
  const winnerB = standingsB[0];
  const runnerUpB = standingsB[1];

  const sf1Fixture = fixtures.find(f => f.id === 'f-sf1');
  const sf2Fixture = fixtures.find(f => f.id === 'f-sf2');
  const finalFixture = fixtures.find(f => f.id === 'f-final');

  const handleGroupDrawClick = () => {
    if (fixtures.length > 0) {
      setShowReshuffleModal(true);
    } else {
      performGroupDraw();
    }
  };

  const handleConfirmReshuffle = () => {
    setShowReshuffleModal(false);
    performGroupDraw();
  };

  return (
    <div className="visual-rally rally-tournament max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary-yellow to-vibrant-orange rounded-xl text-charcoal shadow-glow-yellow">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bebas text-5xl text-white tracking-wide">TOURNAMENT & GROUP STAGE</h1>
            <p className="text-xs text-light-cyan font-montserrat">Automated group draws, round-robin fixtures, score logging, and standings</p>
          </div>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleGroupDrawClick}
              className="px-6 py-3 bg-gradient-to-r from-primary-yellow via-vibrant-orange to-fiery-red text-charcoal font-bebas text-xl font-bold tracking-wider rounded-xl shadow-glow-yellow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Shuffle size={20} />
              <span>{fixtures.length > 0 ? 'Reshuffle Groups & Draw' : 'Perform Random Group Draw'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-4 py-2 rounded-xl border border-gray-700">
            <Lock size={16} className="text-primary-yellow" />
            <span>Admin login required for group draw & scores</span>
          </div>
        )}
      </div>

      {/* Reshuffle Warning Top-Front Modal Popup */}
      {showReshuffleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-panel-gold rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl border-2 border-fiery-red">
            <div className="flex items-center gap-3 text-fiery-red border-b border-fiery-red/30 pb-3">
              <Shuffle className="w-8 h-8 animate-spin" />
              <h3 className="font-bebas text-3xl">CONFIRM GROUP RESHUFFLE</h3>
            </div>
            
            <p className="text-sm font-montserrat text-gray-200 leading-relaxed">
              ⚠️ <strong>Warning:</strong> You are about to reshuffle the groups. This action will reset all current group assignments, standings, and match fixture results.
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowReshuffleModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bebas text-xl rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReshuffle}
                className="flex-1 py-3 bg-gradient-to-r from-fiery-red to-vibrant-orange text-white font-bebas text-xl font-bold rounded-xl shadow-glow-red hover:scale-105 transition-all"
              >
                Confirm Reshuffle
              </button>
            </div>
          </div>
        </div>
      )}

      {fixtures.length === 0 ? (
        <div className="glass-panel-gold p-12 rounded-3xl text-center space-y-4 max-w-2xl mx-auto my-12">
          <Shuffle className="w-16 h-16 text-primary-yellow mx-auto animate-bounce" />
          <h2 className="font-bebas text-4xl text-white">GROUP DRAW NOT STARTED YET</h2>
          <p className="text-gray-300 text-sm">
            Click the <strong className="text-primary-yellow">"Perform Random Group Draw"</strong> button above to split the 6 teams into Group A & Group B and generate official fixtures.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Automated Group Standings */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="font-bebas text-4xl text-white tracking-wide flex items-center gap-2">
                <Award className="text-primary-yellow" /> GROUP STANDINGS
              </h2>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingStandings(!isEditingStandings)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-semibold flex items-center gap-1.5 transition-colors ${
                      isEditingStandings
                        ? 'bg-fiery-red text-white'
                        : 'bg-deep-blue text-light-cyan border border-light-cyan/30 hover:border-light-cyan'
                    }`}
                  >
                    <Edit3 size={14} />
                    <span>{isEditingStandings ? 'Done Editing' : '✏️ Edit Table Data'}</span>
                  </button>

                  {Object.keys(standingsOverrides).length > 0 && (
                    <button
                      onClick={resetStandingOverrides}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-montserrat flex items-center gap-1"
                      title="Reset manual overrides"
                    >
                      <RotateCcw size={14} />
                      <span>Reset Table</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Group A Table */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bebas text-2xl text-primary-yellow">GROUP A STANDINGS</h3>
                  <span className="text-xs text-gray-400">Top 2 advance to Semifinals</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-montserrat">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                        <th className="py-2 font-semibold">Team</th>
                        <th className="py-2 text-center">P</th>
                        <th className="py-2 text-center">W</th>
                        <th className="py-2 text-center">D</th>
                        <th className="py-2 text-center">L</th>
                        <th className="py-2 text-center">GD</th>
                        <th className="py-2 text-center font-bold text-primary-yellow">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {standingsA.map((s, idx) => (
                        <tr key={s.teamId} className={`hover:bg-deep-blue/40 ${idx < 2 ? 'bg-primary-yellow/5 font-semibold' : ''}`}>
                          <td className="py-3 flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bebas font-bold ${idx < 2 ? 'bg-primary-yellow text-charcoal' : 'bg-gray-800 text-gray-400'}`}>
                              {idx + 1}
                            </span>
                            <span className="text-white text-sm font-semibold">{s.teamName}</span>
                            {s.manualOverride && <span className="text-[9px] bg-fiery-red/20 text-fiery-red px-1 rounded">Edited</span>}
                          </td>

                          {isEditingStandings ? (
                            <>
                              <td className="p-1"><input type="number" value={s.played} onChange={e => updateStandingOverride(s.teamId, { played: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.won} onChange={e => updateStandingOverride(s.teamId, { won: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.drawn} onChange={e => updateStandingOverride(s.teamId, { drawn: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.lost} onChange={e => updateStandingOverride(s.teamId, { lost: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.goalDifference} onChange={e => updateStandingOverride(s.teamId, { goalDifference: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.points} onChange={e => updateStandingOverride(s.teamId, { points: Number(e.target.value) })} className="w-12 bg-charcoal border border-primary-yellow text-center text-primary-yellow font-bold" /></td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 text-center text-gray-300">{s.played}</td>
                              <td className="py-3 text-center text-gray-300">{s.won}</td>
                              <td className="py-3 text-center text-gray-300">{s.drawn}</td>
                              <td className="py-3 text-center text-gray-300">{s.lost}</td>
                              <td className="py-3 text-center text-light-cyan font-mono">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                              <td className="py-3 text-center font-bebas text-xl text-primary-yellow">{s.points}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Group B Table */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bebas text-2xl text-light-cyan">GROUP B STANDINGS</h3>
                  <span className="text-xs text-gray-400">Top 2 advance to Semifinals</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-montserrat">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                        <th className="py-2 font-semibold">Team</th>
                        <th className="py-2 text-center">P</th>
                        <th className="py-2 text-center">W</th>
                        <th className="py-2 text-center">D</th>
                        <th className="py-2 text-center">L</th>
                        <th className="py-2 text-center">GD</th>
                        <th className="py-2 text-center font-bold text-primary-yellow">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {standingsB.map((s, idx) => (
                        <tr key={s.teamId} className={`hover:bg-deep-blue/40 ${idx < 2 ? 'bg-light-cyan/5 font-semibold' : ''}`}>
                          <td className="py-3 flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bebas font-bold ${idx < 2 ? 'bg-light-cyan text-charcoal' : 'bg-gray-800 text-gray-400'}`}>
                              {idx + 1}
                            </span>
                            <span className="text-white text-sm font-semibold">{s.teamName}</span>
                            {s.manualOverride && <span className="text-[9px] bg-fiery-red/20 text-fiery-red px-1 rounded">Edited</span>}
                          </td>

                          {isEditingStandings ? (
                            <>
                              <td className="p-1"><input type="number" value={s.played} onChange={e => updateStandingOverride(s.teamId, { played: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.won} onChange={e => updateStandingOverride(s.teamId, { won: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.drawn} onChange={e => updateStandingOverride(s.teamId, { drawn: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.lost} onChange={e => updateStandingOverride(s.teamId, { lost: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.goalDifference} onChange={e => updateStandingOverride(s.teamId, { goalDifference: Number(e.target.value) })} className="w-10 bg-charcoal border text-center text-white" /></td>
                              <td className="p-1"><input type="number" value={s.points} onChange={e => updateStandingOverride(s.teamId, { points: Number(e.target.value) })} className="w-12 bg-charcoal border border-primary-yellow text-center text-primary-yellow font-bold" /></td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 text-center text-gray-300">{s.played}</td>
                              <td className="py-3 text-center text-gray-300">{s.won}</td>
                              <td className="py-3 text-center text-gray-300">{s.drawn}</td>
                              <td className="py-3 text-center text-gray-300">{s.lost}</td>
                              <td className="py-3 text-center text-light-cyan font-mono">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                              <td className="py-3 text-center font-bebas text-xl text-primary-yellow">{s.points}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </section>

          {/* Group Stage Fixtures & Admin Score Logger */}
          <section className="space-y-6">
            <div className="border-b border-gray-800 pb-3">
              <h2 className="font-bebas text-4xl text-white tracking-wide flex items-center gap-2">
                <Calendar className="text-vibrant-orange" /> ROUND-ROBIN FIXTURES
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fixtures.filter(f => f.group === 'A' || f.group === 'B').map((f) => (
                <div key={f.id} className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                    <span className="font-bebas text-base text-primary-yellow">MATCH #{f.matchNo}</span>
                    <span className="text-gray-400">{f.stageName}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="w-5/12 text-center space-y-1">
                      <p className="font-bebas text-xl text-white leading-tight">{f.team1Name}</p>
                    </div>

                    <div className="w-2/12 text-center">
                      <span className="font-bebas text-2xl text-vibrant-orange">VS</span>
                    </div>

                    <div className="w-5/12 text-center space-y-1">
                      <p className="font-bebas text-xl text-white leading-tight">{f.team2Name}</p>
                    </div>
                  </div>

                  {/* Score Logger */}
                  {isAdmin ? (
                    <div className="bg-charcoal/80 p-3 rounded-xl border border-gray-700 flex items-center justify-center gap-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={f.team1Score ?? ''}
                        onChange={(e) => updateFixtureScore(f.id, Number(e.target.value), f.team2Score)}
                        className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                      />
                      <span className="font-bebas text-xl text-gray-400">-</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={f.team2Score ?? ''}
                        onChange={(e) => updateFixtureScore(f.id, f.team1Score, Number(e.target.value))}
                        className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="text-center bg-charcoal/60 p-2.5 rounded-xl border border-gray-800">
                      {f.isCompleted ? (
                        <p className="font-bebas text-3xl text-primary-yellow">
                          {f.team1Score} - {f.team2Score}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Fixture Scheduled</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Knockouts Section */}
          <section className="space-y-6">
            <div className="border-b border-gray-800 pb-3">
              <h2 className="font-bebas text-4xl text-white tracking-wide flex items-center gap-2">
                <Swords className="text-fiery-red" /> KNOCKOUT STAGE (SEMIFINALS & FINAL)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* SF1 */}
              <div className="glass-panel p-6 rounded-2xl space-y-4 border-l-4 border-l-vibrant-orange flex flex-col justify-between">
                <div>
                  <h4 className="font-bebas text-2xl text-vibrant-orange">SEMIFINAL 1</h4>
                  <div className="text-sm space-y-2 mt-2">
                    <p className="text-white font-semibold">{winnerA?.teamName || 'Winner Group A'}</p>
                    <p className="text-xs text-gray-400">vs</p>
                    <p className="text-white font-semibold">{runnerUpB?.teamName || 'Runner-up Group B'}</p>
                  </div>
                </div>

                {/* Score Logger */}
                {isAdmin ? (
                  <div className="bg-charcoal/80 p-3 rounded-xl border border-gray-700 flex items-center justify-center gap-3 mt-4">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={sf1Fixture?.team1Score ?? ''}
                      onChange={(e) => updateFixtureScore('f-sf1', Number(e.target.value), sf1Fixture?.team2Score)}
                      className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                    />
                    <span className="font-bebas text-xl text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={sf1Fixture?.team2Score ?? ''}
                      onChange={(e) => updateFixtureScore('f-sf1', sf1Fixture?.team1Score, Number(e.target.value))}
                      className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="text-center bg-charcoal/60 p-2.5 rounded-xl border border-gray-800 mt-4">
                    {sf1Fixture?.isCompleted ? (
                      <p className="font-bebas text-3xl text-primary-yellow">
                        {sf1Fixture.team1Score} - {sf1Fixture.team2Score}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Match Scheduled</span>
                    )}
                  </div>
                )}
              </div>

              {/* SF2 */}
              <div className="glass-panel p-6 rounded-2xl space-y-4 border-l-4 border-l-vibrant-orange flex flex-col justify-between">
                <div>
                  <h4 className="font-bebas text-2xl text-vibrant-orange">SEMIFINAL 2</h4>
                  <div className="text-sm space-y-2 mt-2">
                    <p className="text-white font-semibold">{winnerB?.teamName || 'Winner Group B'}</p>
                    <p className="text-xs text-gray-400">vs</p>
                    <p className="text-white font-semibold">{runnerUpA?.teamName || 'Runner-up Group A'}</p>
                  </div>
                </div>

                {/* Score Logger */}
                {isAdmin ? (
                  <div className="bg-charcoal/80 p-3 rounded-xl border border-gray-700 flex items-center justify-center gap-3 mt-4">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={sf2Fixture?.team1Score ?? ''}
                      onChange={(e) => updateFixtureScore('f-sf2', Number(e.target.value), sf2Fixture?.team2Score)}
                      className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                    />
                    <span className="font-bebas text-xl text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={sf2Fixture?.team2Score ?? ''}
                      onChange={(e) => updateFixtureScore('f-sf2', sf2Fixture?.team1Score, Number(e.target.value))}
                      className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="text-center bg-charcoal/60 p-2.5 rounded-xl border border-gray-800 mt-4">
                    {sf2Fixture?.isCompleted ? (
                      <p className="font-bebas text-3xl text-primary-yellow">
                        {sf2Fixture.team1Score} - {sf2Fixture.team2Score}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Match Scheduled</span>
                    )}
                  </div>
                )}
              </div>

              {/* FINAL */}
              <div className="glass-panel-gold p-6 rounded-2xl space-y-4 border-l-4 border-l-primary-yellow flex flex-col justify-between">
                <div>
                  <h4 className="font-bebas text-2xl text-primary-yellow flex items-center gap-2">
                    <Trophy size={20} /> FINAL
                  </h4>
                  <div className="text-sm space-y-2 mt-2">
                    <p className="text-white font-bold">Winner Semifinal 1</p>
                    <p className="text-xs text-primary-yellow font-bebas text-lg">VS</p>
                    <p className="text-white font-bold">Winner Semifinal 2</p>
                  </div>
                </div>

                {/* Score Logger */}
                {isAdmin ? (
                  <div className="bg-charcoal/80 p-3 rounded-xl border border-gray-700 flex items-center justify-center gap-3 mt-4">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={finalFixture?.team1Score ?? ''}
                      onChange={(e) => updateFixtureScore('f-final', Number(e.target.value), finalFixture?.team2Score)}
                      className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                    />
                    <span className="font-bebas text-xl text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={finalFixture?.team2Score ?? ''}
                      onChange={(e) => updateFixtureScore('f-final', finalFixture?.team1Score, Number(e.target.value))}
                      className="w-12 h-10 bg-deep-blue border border-gray-600 rounded text-center text-white font-bebas text-2xl focus:border-primary-yellow focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="text-center bg-charcoal/60 p-2.5 rounded-xl border border-gray-800 mt-4">
                    {finalFixture?.isCompleted ? (
                      <p className="font-bebas text-3xl text-primary-yellow">
                        {finalFixture.team1Score} - {finalFixture.team2Score}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Match Scheduled</span>
                    )}
                  </div>
                )}
              </div>

            </div>
          </section>

        </div>
      )}

      {/* Top-Front Modal for Editing Standings Table Data */}
      {isEditingStandings && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl glass-panel-gold rounded-3xl p-6 text-white space-y-6 shadow-2xl border-2 border-primary-yellow/50">
            <button
              onClick={() => setIsEditingStandings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-between border-b border-primary-yellow/30 pb-3">
              <h3 className="font-bebas text-3xl text-primary-yellow">Edit Standings Table Data</h3>
              <button
                onClick={() => setIsEditingStandings(false)}
                className="px-4 py-1.5 bg-primary-yellow text-charcoal font-bebas text-lg font-bold rounded-xl"
              >
                Done Editing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-1">
              {/* Group A Edit */}
              <div className="space-y-3">
                <h4 className="font-bebas text-xl text-primary-yellow">Group A Table Data</h4>
                <div className="space-y-2">
                  {standingsA.map((s) => (
                    <div key={s.teamId} className="bg-charcoal/90 p-3 rounded-xl border border-gray-700 space-y-2 text-xs">
                      <p className="font-bold text-white text-sm">{s.teamName}</p>
                      <div className="grid grid-cols-6 gap-2 text-[11px]">
                        <div><span className="block text-gray-400">P</span><input type="number" value={s.played} onChange={e => updateStandingOverride(s.teamId, { played: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">W</span><input type="number" value={s.won} onChange={e => updateStandingOverride(s.teamId, { won: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">D</span><input type="number" value={s.drawn} onChange={e => updateStandingOverride(s.teamId, { drawn: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">L</span><input type="number" value={s.lost} onChange={e => updateStandingOverride(s.teamId, { lost: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">GD</span><input type="number" value={s.goalDifference} onChange={e => updateStandingOverride(s.teamId, { goalDifference: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-primary-yellow font-bold">PTS</span><input type="number" value={s.points} onChange={e => updateStandingOverride(s.teamId, { points: Number(e.target.value) })} className="w-full bg-deep-blue border border-primary-yellow rounded p-1 text-center text-primary-yellow font-bold" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group B Edit */}
              <div className="space-y-3">
                <h4 className="font-bebas text-xl text-teal">Group B Table Data</h4>
                <div className="space-y-2">
                  {standingsB.map((s) => (
                    <div key={s.teamId} className="bg-charcoal/90 p-3 rounded-xl border border-gray-700 space-y-2 text-xs">
                      <p className="font-bold text-white text-sm">{s.teamName}</p>
                      <div className="grid grid-cols-6 gap-2 text-[11px]">
                        <div><span className="block text-gray-400">P</span><input type="number" value={s.played} onChange={e => updateStandingOverride(s.teamId, { played: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">W</span><input type="number" value={s.won} onChange={e => updateStandingOverride(s.teamId, { won: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">D</span><input type="number" value={s.drawn} onChange={e => updateStandingOverride(s.teamId, { drawn: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">L</span><input type="number" value={s.lost} onChange={e => updateStandingOverride(s.teamId, { lost: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-gray-400">GD</span><input type="number" value={s.goalDifference} onChange={e => updateStandingOverride(s.teamId, { goalDifference: Number(e.target.value) })} className="w-full bg-deep-blue border border-gray-700 rounded p-1 text-center text-white" /></div>
                        <div><span className="block text-teal font-bold">PTS</span><input type="number" value={s.points} onChange={e => updateStandingOverride(s.teamId, { points: Number(e.target.value) })} className="w-full bg-deep-blue border border-teal rounded p-1 text-center text-teal font-bold" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
