export interface CitizenReputation {
  id: string
  name: string
  avatar: string
  trustScore: number
  contributionScore: number
  communityRank: string
  volunteerRank: string
  coins: number
  badges: string[]
  achievements: number
  monthlyContribution: number
  lifetimeContribution: number
  verifiedComplaints: number
  falseReports: number
  responseRate: number
}

export const citizens: CitizenReputation[] = [
  {
    id: "CIT-001",
    name: "Priya Nair",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 98,
    contributionScore: 96,
    communityRank: "City Champion",
    volunteerRank: "Diamond Volunteer",
    coins: 12450,
    badges: ["City Champion", "Community Hero", "Verified Reporter", "Eagle Eye"],
    achievements: 12,
    monthlyContribution: 28,
    lifetimeContribution: 148,
    verifiedComplaints: 142,
    falseReports: 0,
    responseRate: 96,
  },
  {
    id: "CIT-002",
    name: "Aarav Sharma",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 94,
    contributionScore: 91,
    communityRank: "Community Hero",
    volunteerRank: "Platinum Volunteer",
    coins: 10980,
    badges: ["Community Hero", "Verified Reporter", "Eagle Eye", "First Responder"],
    achievements: 10,
    monthlyContribution: 24,
    lifetimeContribution: 132,
    verifiedComplaints: 126,
    falseReports: 1,
    responseRate: 93,
  },
  {
    id: "CIT-003",
    name: "Sneha Iyer",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 92,
    contributionScore: 89,
    communityRank: "Community Hero",
    volunteerRank: "Gold Volunteer",
    coins: 9640,
    badges: ["Community Hero", "Verified Reporter", "Neighborhood Guardian"],
    achievements: 9,
    monthlyContribution: 21,
    lifetimeContribution: 119,
    verifiedComplaints: 112,
    falseReports: 0,
    responseRate: 94,
  },
  {
    id: "CIT-004",
    name: "Rohan Verma",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 88,
    contributionScore: 84,
    communityRank: "Verified Reporter",
    volunteerRank: "Silver Volunteer",
    coins: 8120,
    badges: ["Verified Reporter", "Active Citizen", "First Responder"],
    achievements: 7,
    monthlyContribution: 18,
    lifetimeContribution: 101,
    verifiedComplaints: 94,
    falseReports: 2,
    responseRate: 89,
  },
  {
    id: "CIT-005",
    name: "Kabir Khan",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 85,
    contributionScore: 80,
    communityRank: "Verified Reporter",
    volunteerRank: "Silver Volunteer",
    coins: 7350,
    badges: ["Verified Reporter", "Active Citizen"],
    achievements: 6,
    monthlyContribution: 16,
    lifetimeContribution: 94,
    verifiedComplaints: 86,
    falseReports: 3,
    responseRate: 88,
  },
  {
    id: "CIT-006",
    name: "Ananya Reddy",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 90,
    contributionScore: 87,
    communityRank: "Verified Reporter",
    volunteerRank: "Gold Volunteer",
    coins: 6890,
    badges: ["Verified Reporter", "Active Citizen", "Streak Keeper"],
    achievements: 8,
    monthlyContribution: 19,
    lifetimeContribution: 87,
    verifiedComplaints: 82,
    falseReports: 1,
    responseRate: 91,
  },
  {
    id: "CIT-007",
    name: "Vikram Patel",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 78,
    contributionScore: 72,
    communityRank: "Active Citizen",
    volunteerRank: "Bronze Volunteer",
    coins: 5980,
    badges: ["Active Citizen"],
    achievements: 4,
    monthlyContribution: 12,
    lifetimeContribution: 76,
    verifiedComplaints: 68,
    falseReports: 4,
    responseRate: 85,
  },
  {
    id: "CIT-008",
    name: "Meera Joshi",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    trustScore: 82,
    contributionScore: 78,
    communityRank: "Active Citizen",
    volunteerRank: "Bronze Volunteer",
    coins: 5240,
    badges: ["Active Citizen", "First Responder"],
    achievements: 5,
    monthlyContribution: 14,
    lifetimeContribution: 68,
    verifiedComplaints: 62,
    falseReports: 2,
    responseRate: 87,
  },
]

export const reputationBadges = [
  { name: "First Responder", description: "Submit your first 10 reports", tier: "bronze", unlocked: true },
  { name: "Eagle Eye", description: "Report 50 verified issues", tier: "silver", unlocked: true },
  { name: "Streak Keeper", description: "Report on 30 consecutive days", tier: "silver", unlocked: false },
  { name: "Neighborhood Guardian", description: "Get 25 issues resolved", tier: "gold", unlocked: false },
  { name: "Community Hero", description: "Awarded for outstanding community impact", tier: "gold", unlocked: false },
  { name: "City Champion", description: "The highest honor for top civic contributors", tier: "platinum", unlocked: false },
]

export const citizenAchievements = [
  { name: "First Responder", description: "Submit your first 10 reports", progress: 10, total: 10, completed: true },
  { name: "Eagle Eye", description: "Report 50 verified issues", progress: 32, total: 50, completed: false },
  { name: "Streak Keeper", description: "Report on 30 consecutive days", progress: 18, total: 30, completed: false },
  { name: "Neighborhood Guardian", description: "Get 25 issues resolved", progress: 14, total: 25, completed: false },
  { name: "Community Voice", description: "Get 100 upvotes from citizens", progress: 67, total: 100, completed: false },
  { name: "Verified Reporter", description: "Maintain 95% accuracy for 30 days", progress: 28, total: 30, completed: false },
]

export const currentCitizen = citizens[1]
