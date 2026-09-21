import { Team, Player, TournamentRule, MatchFixture } from '../types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Circuit Breakers',
    shortName: 'CBR',
    owner: 'Prof. Dr. Alamgir Hossain',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&q=80',
    color: '#FFD600', // Yellow
    startingPurse: 1500,
    spentPurse: 0,
    maxSquadSize: 10,
    group: 'A'
  },
  {
    id: 'team-2',
    name: 'Cyber Titans',
    shortName: 'CYT',
    owner: 'Dr. Shahinur Islam',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1543351611-c82399575a20?w=300&q=80',
    color: '#00B3A4', // Teal
    startingPurse: 1500,
    spentPurse: 0,
    maxSquadSize: 10,
    group: 'A'
  },
  {
    id: 'team-3',
    name: 'Signal Kings',
    shortName: 'SGK',
    owner: 'Engr. Mahmudul Hasan',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&q=80',
    color: '#FF6B00', // Vibrant Orange
    startingPurse: 1500,
    spentPurse: 0,
    maxSquadSize: 10,
    group: 'A'
  },
  {
    id: 'team-4',
    name: 'Silicon Spartans',
    shortName: 'SSP',
    owner: 'Dr. Tariqul Islam',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&q=80',
    color: '#4EE4FF', // Light Cyan
    startingPurse: 1500,
    spentPurse: 0,
    maxSquadSize: 10,
    group: 'B'
  },
  {
    id: 'team-5',
    name: 'Voltage Warriors',
    shortName: 'VWR',
    owner: 'Engr. Sajjad Hossain',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=300&q=80',
    color: '#E63946', // Fiery Red
    startingPurse: 1500,
    spentPurse: 0,
    maxSquadSize: 10,
    group: 'B'
  },
  {
    id: 'team-6',
    name: 'Byte Force FC',
    shortName: 'BFF',
    owner: 'Engr. Nazmul Huda',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&q=80',
    color: '#0B2D3A', // Deep Blue
    startingPurse: 1500,
    spentPurse: 0,
    maxSquadSize: 10,
    group: 'B'
  }
];

export const INITIAL_ICON_PLAYERS: Player[] = [
  {
    id: 'icon-1',
    name: 'Shakib Ahmed',
    roll: '1903001',
    series: '19 Series',
    position: 'FORWARD',
    isIcon: true,
    status: 'ICON',
    goalsScored: 0,
    rating: 94,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80'
  },
  {
    id: 'icon-2',
    name: 'Raihan Kabir',
    roll: '1903015',
    series: '19 Series',
    position: 'MIDFIELDER',
    isIcon: true,
    status: 'ICON',
    goalsScored: 0,
    rating: 92,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80'
  },
  {
    id: 'icon-3',
    name: 'Tanvir Hossain',
    roll: '2003004',
    series: '20 Series',
    position: 'FORWARD',
    isIcon: true,
    status: 'ICON',
    goalsScored: 0,
    rating: 91,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'
  },
  {
    id: 'icon-4',
    name: 'Farhan Ali',
    roll: '2003022',
    series: '20 Series',
    position: 'GOALKEEPER',
    isIcon: true,
    status: 'ICON',
    goalsScored: 0,
    rating: 93,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
  },
  {
    id: 'icon-5',
    name: 'Mahfuzur Rahman',
    roll: '2103002',
    series: '21 Series',
    position: 'DEFENDER',
    isIcon: true,
    status: 'ICON',
    goalsScored: 0,
    rating: 90,
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80'
  },
  {
    id: 'icon-6',
    name: 'Ashiqur Rahman',
    roll: '2103050',
    series: '21 Series',
    position: 'MIDFIELDER',
    isIcon: true,
    status: 'ICON',
    goalsScored: 0,
    rating: 89,
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80'
  }
];

export const INITIAL_POOL_PLAYERS: Player[] = [
  { id: 'p-1', name: 'Naimul Islam', roll: '2003011', series: '20 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 85 },
  { id: 'p-2', name: 'Zubair Hossain', roll: '2003025', series: '20 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 83 },
  { id: 'p-3', name: 'Sabbir Ahmed', roll: '2103014', series: '21 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 82 },
  { id: 'p-4', name: 'Tahmid Khan', roll: '2103033', series: '21 Series', position: 'GOALKEEPER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 86 },
  { id: 'p-5', name: 'Kazi Mahmud', roll: '2203005', series: '22 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 81 },
  { id: 'p-6', name: 'Arifur Rahman', roll: '2203019', series: '22 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 84 },
  { id: 'p-7', name: 'Shahriar Kabir', roll: '2203040', series: '22 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 80 },
  { id: 'p-8', name: 'Imtiaz Hossain', roll: '2303002', series: '23 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 79 },
  { id: 'p-9', name: 'Fahim Chowdhury', roll: '2303018', series: '23 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 78 },
  { id: 'p-10', name: 'Mehedi Hasan', roll: '2303036', series: '23 Series', position: 'GOALKEEPER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 82 },
  { id: 'p-11', name: 'Amanullah Siddique', roll: '1903028', series: '19 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 87 },
  { id: 'p-12', name: 'Rashid Ul Haq', roll: '1903044', series: '19 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 88 },
  { id: 'p-13', name: 'Hasibul Alam', roll: '2003052', series: '20 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 84 },
  { id: 'p-14', name: 'Tarek Mahmud', roll: '2103009', series: '21 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 82 },
  { id: 'p-15', name: 'Nafis Iqbal', roll: '2103041', series: '21 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 85 },
  { id: 'p-16', name: 'Habibur Rahman', roll: '2203011', series: '22 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 80 },
  { id: 'p-17', name: 'Sourav Saha', roll: '2203029', series: '22 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 79 },
  { id: 'p-18', name: 'Biplob Das', roll: '2303010', series: '23 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 77 },
  { id: 'p-19', name: 'Anik Dutta', roll: '2303027', series: '23 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 76 },
  { id: 'p-20', name: 'Shamsul Haque', roll: '2303045', series: '23 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 75 },
  { id: 'p-21', name: 'Asif Mahmud', roll: '2003038', series: '20 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 86 },
  { id: 'p-22', name: 'Nazmul Abedin', roll: '2103020', series: '21 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 83 },
  { id: 'p-23', name: 'Sajid Islam', roll: '2103055', series: '21 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 81 },
  { id: 'p-24', name: 'Wasim Akram', roll: '2203003', series: '22 Series', position: 'GOALKEEPER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 84 },
  { id: 'p-25', name: 'Jahid Hasan', roll: '2203048', series: '22 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 82 },
  { id: 'p-26', name: 'Rabiul Islam', roll: '2303015', series: '23 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 78 },
  { id: 'p-27', name: 'Arafat Hossain', roll: '2303030', series: '23 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 77 },
  { id: 'p-28', name: 'Miraz Uddin', roll: '2003060', series: '20 Series', position: 'FORWARD', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 85 },
  { id: 'p-29', name: 'Saiful Islam', roll: '2103048', series: '21 Series', position: 'MIDFIELDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 83 },
  { id: 'p-30', name: 'Rubel Hossain', roll: '2203033', series: '22 Series', position: 'DEFENDER', isIcon: false, status: 'AVAILABLE', goalsScored: 0, rating: 80 }
];

export const INITIAL_RULES: TournamentRule[] = [
  {
    id: 'rule-1',
    title: 'Starting Budget',
    description: 'Each team is allocated a fixed starting purse of exactly 1,500 TK for acquiring players during the auction.',
    category: 'BUDGET',
    isDefault: true
  },
  {
    id: 'rule-2',
    title: 'Squad Size Requirement',
    description: 'Each squad must consist of exactly 10 players: 1 designated Icon Player and 9 Players acquired from the live auction pool.',
    category: 'SQUAD',
    isDefault: true
  },
  {
    id: 'rule-3',
    title: 'Auction Base Price',
    description: 'The base bidding price for all pool players starts at 50 TK.',
    category: 'BIDDING',
    isDefault: true
  },
  {
    id: 'rule-4',
    title: 'Tiered Bidding Increments',
    description: 'Bids under 100 TK increase by 10 TK; bids between 100 TK and 200 TK increase by 20 TK; bids over 200 TK increase by 50 TK.',
    category: 'BIDDING',
    isDefault: true
  },
  {
    id: 'rule-5',
    title: 'Hidden Bidding Threshold',
    description: 'When bidding for any player exceeds 200 TK, team managers may request a 30-second secret written bid round submitted directly to the Auctioneer.',
    category: 'BIDDING',
    isDefault: true
  },
  {
    id: 'rule-6',
    title: 'Forced Resell Policy',
    description: 'If a team manager exceeds their total 1,500 TK purse or fails to complete a 10-player roster within budget, their highest-value acquired player is automatically returned to the re-auction pool.',
    category: 'BUDGET',
    isDefault: true
  },
  {
    id: 'rule-7',
    title: 'Group Stage Scoring',
    description: 'Teams earn 3 points for a win, 1 point for a draw, and 0 points for a loss. Ties in group standings are broken by Goal Difference (GD), then Goals For (GF).',
    category: 'MATCH',
    isDefault: true
  },
  {
    id: 'rule-8',
    title: 'Knockout Stage Penalty Shootout',
    description: 'If a Semifinal or Final match ends in a draw at full time, the match proceeds directly to a 3-penalty shootout.',
    category: 'MATCH',
    isDefault: true
  }
];
