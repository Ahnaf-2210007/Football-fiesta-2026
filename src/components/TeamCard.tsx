'use client';

import React, { useState } from 'react';
import { Team, Player } from '../types';
import { useApp } from '../context/AppContext';
import { normalizeImageUrl, handleImageError } from '../utils/imageUtils';
import { Shield, Users, Edit2, User, Crown, X, Share2, Download, Image as ImageIcon } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  players: Player[];
  editable?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, players, editable = false }) => {
  const { isAdmin, updateTeam, removeTeam } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [editOwner, setEditOwner] = useState(team.owner);
  const [editOwnerPhoto, setEditOwnerPhoto] = useState(team.ownerPhotoUrl || '');
  const [editLogo, setEditLogo] = useState(team.logoUrl || '');
  const [editColor, setEditColor] = useState(team.color);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [teamImage, setTeamImage] = useState<string | null>(null);

  const teamPlayers = players.filter(p => p.teamId === team.id);
  const displayName = team.name || `Team Slot ${team.id.replace('team-', '')}`;
  const displayOwner = team.owner || 'Not configured';
  const iconPlayer = players.find(p => p.id === team.iconPlayerId);
  const auctionPlayers = teamPlayers.filter(p => !p.isIcon);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam({
      ...team,
      name: editName,
      owner: editOwner,
      ownerPhotoUrl: normalizeImageUrl(editOwnerPhoto),
      logoUrl: normalizeImageUrl(editLogo),
      color: editColor
    });
    setIsEditing(false);
  };

  const managerPhoto = normalizeImageUrl(team.ownerPhotoUrl);
  const logoUrl = normalizeImageUrl(team.logoUrl);

  const loadCardImage = (url?: string) => new Promise<HTMLImageElement | null>((resolve) => {
    if (!url) return resolve(null);
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url.startsWith('/') ? url : `/api/image?url=${encodeURIComponent(url)}`;
  });

  const drawCoverImage = (context: CanvasRenderingContext2D, image: HTMLImageElement | null, x: number, y: number, width: number, height: number) => {
    if (!image) return;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  };

  const drawContainImage = (context: CanvasRenderingContext2D, image: HTMLImageElement | null, x: number, y: number, width: number, height: number) => {
    if (!image) return;
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  };

  const fitCanvasText = (context: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) => {
    context.font = font;
    let value = text;
    while (value.length > 1 && context.measureText(value).width > maxWidth) value = `${value.slice(0, -2)}…`;
    return value;
  };

  const handleShare = async () => {
    setIsGeneratingImage(true);
    try {
      await document.fonts.ready;
      const rosterPlayers = auctionPlayers;
      const rosterRows = Math.ceil(rosterPlayers.length / 2);
      const canvasHeight = Math.max(1350, 760 + rosterRows * 112);
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = canvasHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable');

      const [background, fiestaLogo, logo, manager, icon, ...playersImages] = await Promise.all([
        loadCardImage('/stadium_hero_bg.png'),
        loadCardImage('/H_logo.png'),
        loadCardImage(logoUrl),
        loadCardImage(managerPhoto),
        loadCardImage(iconPlayer?.photoUrl ? normalizeImageUrl(iconPlayer.photoUrl) : undefined),
        ...rosterPlayers.map(player => loadCardImage(player.photoUrl ? normalizeImageUrl(player.photoUrl) : undefined))
      ]);

      context.fillStyle = '#061421';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.globalAlpha = 0.28;
      drawCoverImage(context, background, 0, 0, canvas.width, canvas.height);
      context.restore();
      context.fillStyle = 'rgba(3, 16, 31, 0.76)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#4ee4ff';
      context.lineWidth = 8;
      context.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);
      context.strokeStyle = '#ffd600';
      context.lineWidth = 4;
      context.strokeRect(62, 62, canvas.width - 124, canvas.height - 124);

      context.fillStyle = 'rgba(5, 19, 38, 0.96)';
      context.fillRect(72, 72, 760, canvas.height - 144);
      context.strokeStyle = team.color;
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(832, 120);
      context.lineTo(832, canvas.height - 120);
      context.stroke();

      drawContainImage(context, fiestaLogo, 1660, 86, 620, 180);
      context.fillStyle = '#ffd600';
      context.font = 'bold 28px Bebas Neue, sans-serif';
      context.fillText('PLAYER / TEAM', 900, 190);
      context.strokeStyle = '#ffd600';
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(900, 220);
      context.lineTo(2180, 220);
      context.stroke();

      context.fillStyle = '#ffffff';
      context.font = 'bold 82px Bebas Neue, sans-serif';
      context.fillText(fitCanvasText(context, displayName.toUpperCase(), 1120, 'bold 82px Bebas Neue, sans-serif'), 116, 210);
      context.fillStyle = '#4ee4ff';
      context.font = 'bold 34px Montserrat, sans-serif';
      context.fillText(team.shortName, 120, 270);
      context.fillStyle = '#ff6b00';
      context.font = 'bold 28px Montserrat, sans-serif';
      context.fillText(team.group ? `GROUP ${team.group}` : 'TEAM ROSTER', 120, 318);

      context.fillStyle = 'rgba(11, 45, 58, 0.9)';
      context.roundRect(150, 385, 600, 390, 36);
      context.fill();
      context.save();
      context.beginPath();
      context.roundRect(180, 415, 540, 330, 28);
      context.clip();
      drawContainImage(context, logo, 180, 415, 540, 330);
      context.restore();

      context.fillStyle = '#9aa8b2';
      context.font = 'bold 22px Montserrat, sans-serif';
      context.fillText('TEAM MANAGER', 120, 875);
      context.fillStyle = '#ffffff';
      context.font = 'bold 37px Montserrat, sans-serif';
      context.fillText(fitCanvasText(context, displayOwner, 560, 'bold 37px Montserrat, sans-serif'), 120, 925);
      if (manager) {
        context.save();
        context.beginPath();
        context.roundRect(120, 980, 120, 120, 20);
        context.clip();
        drawCoverImage(context, manager, 120, 980, 120, 120);
        context.restore();
      }
      context.fillStyle = '#4ee4ff';
      context.font = 'bold 42px Bebas Neue, sans-serif';
      context.fillText(`${teamPlayers.length} PLAYERS`, 280, 1055);
      context.fillStyle = '#9aa8b2';
      context.font = '20px Montserrat, sans-serif';
      context.fillText('ECE FOOTBALL FIESTA', 280, 1095);

      context.fillStyle = '#ffd600';
      context.font = 'bold 28px Bebas Neue, sans-serif';
      context.fillText('ICON PLAYER', 900, 320);
      context.fillStyle = 'rgba(11, 45, 58, 0.9)';
      context.roundRect(900, 350, 1280, 180, 24);
      context.fill();
      if (icon) {
        context.save();
        context.beginPath();
        context.roundRect(930, 375, 130, 130, 18);
        context.clip();
        drawCoverImage(context, icon, 930, 375, 130, 130);
        context.restore();
      }
      context.fillStyle = '#ffffff';
      context.font = 'bold 36px Montserrat, sans-serif';
      context.fillText(fitCanvasText(context, iconPlayer?.name || 'No icon player assigned', 990, 'bold 36px Montserrat, sans-serif'), 1100, 435);
      context.fillStyle = '#9aa8b2';
      context.font = '21px Montserrat, sans-serif';
      context.fillText(iconPlayer ? `${iconPlayer.roll}  •  ${iconPlayer.position}` : 'Assign an icon player', 1100, 475);

      context.fillStyle = '#4ee4ff';
      context.font = 'bold 28px Bebas Neue, sans-serif';
      context.fillText(`SQUAD (${rosterPlayers.length})`, 900, 610);
      rosterPlayers.forEach((player, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = 900 + column * 650;
        const y = 650 + row * 112;
        context.fillStyle = 'rgba(4, 18, 31, 0.96)';
        context.roundRect(x, y, 610, 90, 16);
        context.fill();
        if (playersImages[index]) {
          context.save();
          context.beginPath();
          context.roundRect(x + 12, y + 10, 70, 70, 12);
          context.clip();
          drawCoverImage(context, playersImages[index], x + 12, y + 10, 70, 70);
          context.restore();
        }
        context.fillStyle = '#ffffff';
        context.font = 'bold 23px Montserrat, sans-serif';
        context.fillText(fitCanvasText(context, player.name, 470, 'bold 23px Montserrat, sans-serif'), x + 105, y + 42);
        context.fillStyle = '#9aa8b2';
        context.font = '16px Montserrat, sans-serif';
        context.fillText(`${player.roll}  •  ${player.position}`, x + 105, y + 68);
      });

      setTeamImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Unable to generate team card image', error);
      window.alert('Unable to generate the team card image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadTeamImage = () => {
    if (!teamImage) return;
    const link = document.createElement('a');
    link.href = teamImage;
    link.download = `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-team-card.png`;
    link.click();
  };

  const shareTeamImage = async () => {
    if (!teamImage) return;
    const response = await fetch(teamImage);
    const file = new File([await response.blob()], `${displayName}-team-card.png`, { type: 'image/png' });
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({ title: `${displayName} Team Card`, files: [file] });
    } else {
      downloadTeamImage();
    }
  };

  return (
    <div 
      id={`team-card-${team.id}`}
      className="glass-panel rounded-3xl overflow-hidden transition-all duration-300 hover:border-primary-yellow/50 hover:shadow-2xl relative group flex flex-col lg:flex-row"
      style={{ borderTop: `4px solid ${team.color}` }}
    >
      {/* Header Info */}
      <div className="p-5 lg:w-4/12 bg-gradient-to-b from-deep-blue/90 to-charcoal/90 space-y-3">
        <div className="flex items-start justify-between gap-4">
          
          {/* Logo & Team Title */}
          <div className="flex min-w-0 items-center gap-4">
            <div 
              className="w-24 h-24 rounded-2xl overflow-hidden bg-charcoal border-2 flex items-center justify-center shrink-0 shadow-md"
              style={{ borderColor: team.color }}
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={displayName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => handleImageError(e, team.logoUrl)}
                />
              ) : (
                <Shield className="w-9 h-9" style={{ color: team.color }} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="min-w-0 break-words font-bebas text-3xl tracking-wide text-white">{displayName}</h3>
                <span className="shrink-0 text-xs font-bebas px-2 py-0.5 rounded bg-deep-blue text-light-cyan border border-light-cyan/30">
                  {team.shortName}
                </span>
              </div>
              {team.group && (
                <span className="inline-block text-[10px] font-bebas px-2 py-0.5 rounded mt-0.5 bg-vibrant-orange/20 text-vibrant-orange border border-vibrant-orange/40">
                  Group {team.group}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-charcoal/90 hover:bg-light-cyan hover:text-charcoal text-light-cyan rounded-xl border border-light-cyan/40 transition-colors shadow-md"
              title="Share team card"
              aria-label={`Share ${displayName} team card`}
            >
              {isGeneratingImage ? <ImageIcon size={16} className="animate-pulse" /> : <Share2 size={16} />}
            </button>

          {isAdmin && editable && (
            <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditName(team.name);
                setEditOwner(team.owner);
                setEditOwnerPhoto(team.ownerPhotoUrl || '');
                setEditLogo(team.logoUrl || '');
                setEditColor(team.color);
                setIsEditing(true);
              }}
              className="p-2 bg-charcoal/90 hover:bg-primary-yellow hover:text-charcoal text-gray-300 rounded-xl border border-gray-700 transition-colors shadow-md shrink-0"
              title="Edit Team & Manager Info"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Remove ${displayName}? Its players will return to the pool.`)) {
                  removeTeam(team.id);
                }
              }}
              className="p-2 bg-fiery-red/90 hover:bg-fiery-red text-white rounded-xl border border-fiery-red/60 transition-colors shadow-md shrink-0"
              title="Remove Team"
            >
              <X size={16} />
            </button>
            </div>
          )}
          </div>
        </div>

        {/* Manager Banner Showcase */}
        <div className="flex items-center gap-3 bg-charcoal/90 p-3 rounded-2xl border border-gray-800">
          <div className="w-16 h-16 rounded-xl bg-deep-blue border border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
            {managerPhoto ? (
              <img 
                src={managerPhoto} 
                alt={team.owner} 
                className="w-full h-full object-cover" 
                onError={(e) => handleImageError(e, team.ownerPhotoUrl)}
              />
            ) : (
              <User size={22} className="text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Team Manager</span>
            <p className="break-words text-sm font-bold text-white">{displayOwner}</p>
          </div>
        </div>

        {/* Squad Count Header Bar */}
        <div className="flex items-center justify-between bg-charcoal/60 px-4 py-2.5 rounded-xl border border-gray-800/80">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-teal" />
            <span className="text-xs text-gray-300 font-semibold uppercase">Squad Roster</span>
          </div>
          <p className="font-bebas text-xl tracking-wide text-light-cyan">
            {teamPlayers.length} Players
          </p>
        </div>
      </div>

      {/* Roster Breakdown with Player Photos & Names */}
      <div className="p-5 lg:w-8/12 border-t lg:border-t-0 lg:border-l border-gray-800/80 space-y-3">
        
        {/* Icon Player Section */}
        <div>
          <h4 className="text-xs font-semibold text-primary-yellow uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Icon Player</span>
            <span className="bg-primary-yellow/20 text-primary-yellow px-1.5 py-0.5 rounded text-[10px] font-bebas">GOLD ICON</span>
          </h4>

          {iconPlayer ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary-yellow/10 to-transparent p-2.5 rounded-xl border border-primary-yellow/30">
              <div className="w-10 h-10 rounded-lg bg-charcoal border border-primary-yellow overflow-hidden flex items-center justify-center shrink-0">
                {iconPlayer.photoUrl ? (
                  <img 
                    src={normalizeImageUrl(iconPlayer.photoUrl)} 
                    alt={iconPlayer.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => handleImageError(e, iconPlayer.photoUrl)}
                  />
                ) : (
                  <User size={18} className="text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold text-white leading-tight">{iconPlayer.name}</p>
                <p className="text-[10px] text-gray-400">{iconPlayer.roll} • {iconPlayer.position}</p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl border border-dashed border-gray-700 text-center text-xs text-gray-500">
              No Icon Player Assigned
            </div>
          )}
        </div>

        {/* Auctioned Roster Section */}
        <div>
          <h4 className="text-xs font-semibold text-light-cyan uppercase tracking-wider mb-2">
            Auctioned Squad ({auctionPlayers.length})
          </h4>

          {auctionPlayers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {auctionPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-2 bg-charcoal/70 hover:bg-deep-blue/70 rounded-xl text-xs transition-colors border border-gray-800 min-h-[68px]">
                  <div className="w-12 h-14 rounded-lg bg-charcoal border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                    {p.photoUrl ? (
                      <img 
                        src={normalizeImageUrl(p.photoUrl)} 
                        alt={p.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, p.photoUrl)}
                      />
                    ) : (
                      <User size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{p.roll} • {p.position}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-3">No players acquired from live auction pool yet</p>
          )}
        </div>
      </div>

      {teamImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 sm:p-8">
          <div className="flex max-h-full w-full max-w-6xl flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bebas text-3xl text-white">{displayName} TEAM CARD</h3>
              <button
                onClick={() => setTeamImage(null)}
                className="p-2 text-gray-300 hover:text-white"
                title="Close preview"
                aria-label="Close team card preview"
              >
                <X size={24} />
              </button>
            </div>
            <div className="min-h-0 overflow-auto rounded-2xl border border-light-cyan/30 bg-charcoal p-2 shadow-2xl">
              <img src={teamImage} alt={`${displayName} team card`} className="mx-auto h-auto w-full object-contain" />
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={downloadTeamImage}
                className="flex items-center gap-2 rounded-xl bg-gray-800 px-5 py-3 font-bebas text-lg text-white hover:bg-gray-700"
              >
                <Download size={18} /> Download PNG
              </button>
              <button
                onClick={() => void shareTeamImage()}
                className="flex items-center gap-2 rounded-xl bg-primary-yellow px-5 py-3 font-bebas text-lg font-bold text-charcoal hover:opacity-90"
              >
                <Share2 size={18} /> Share PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top-Front Admin Edit Team Modal Popup */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md glass-panel-gold rounded-3xl p-6 text-white space-y-4 shadow-2xl border-2 border-primary-yellow/50">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-bebas text-3xl text-primary-yellow">Edit Team & Manager Info</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Team Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Manager / Owner Name</label>
                <input
                  type="text"
                  value={editOwner}
                  onChange={e => setEditOwner(e.target.value)}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Manager Photo Link (Google Drive / Web URL)</label>
                <input
                  type="text"
                  value={editOwnerPhoto}
                  onChange={e => setEditOwnerPhoto(e.target.value)}
                  placeholder="Paste manager image link..."
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Team Logo URL</label>
                <input
                  type="text"
                  value={editLogo}
                  onChange={e => setEditLogo(e.target.value)}
                  placeholder="Paste team logo image link..."
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-300 block mb-1">Theme Color</label>
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-full h-10 bg-deep-blue border border-gray-700 rounded-xl cursor-pointer p-1"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-bebas text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-yellow text-charcoal font-bebas text-xl font-bold rounded-xl shadow-glow-yellow"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
