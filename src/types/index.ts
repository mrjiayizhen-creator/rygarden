export interface Beehive {
  id: string;
  name: string;
  location: string;
  queenAge: number;
  queenStatus: "healthy" | "weak" | "replaced";
  colonyStrength: "strong" | "medium" | "weak";
  lastInspection: string;
  notes: string;
  createdAt: string;
}

export interface BeeInspection {
  id: string;
  hiveId: string;
  date: string;
  honeyFrames: number;
  broodPattern: "excellent" | "good" | "poor";
  pests: string[];
  mood: "calm" | "defensive" | "aggressive";
  actionTaken: string;
  notes: string;
}

export interface Poultry {
  id: string;
  type: "chicken" | "duck" | "goose" | "other";
  breed: string;
  name: string;
  age: number;
  gender: "hen" | "rooster" | "unknown";
  status: "active" | "sick" | "brooding" | "deceased";
  createdAt: string;
}

export interface FeedingRecord {
  id: string;
  poultryId: string | null;
  date: string;
  feedType: string;
  amount: number;
  notes: string;
}

export interface EggRecord {
  id: string;
  date: string;
  count: number;
  type: "chicken" | "duck" | "goose";
}

export interface CropPlot {
  id: string;
  name: string;
  crop: string;
  season: "spring" | "summer" | "autumn" | "winter";
  plantedDate: string;
  expectedHarvest: string;
  status: "seeding" | "growing" | "flowering" | "fruiting" | "harvested" | "dormant";
  area: number;
  notes: string;
  createdAt: string;
}

export interface GardenLog {
  id: string;
  plotId: string;
  date: string;
  action: "watered" | "fertilized" | "weeded" | "pruned" | "pest_control" | "harvested" | "planted";
  detail: string;
  harvestAmount?: number;
}

export interface VideoLink {
  id: string;
  entityId: string;
  entityType: "beehive" | "poultry" | "cropPlot";
  url: string;
  platform: "bilibili" | "youku" | "other";
  title: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: "happy" | "calm" | "tired" | "excited" | "grateful" | "reflective";
  createdAt: string;
  updatedAt: string;
}

export type Page = "dashboard" | "bee" | "poultry" | "garden" | "journal" | "settings" | "admin";

export type UserRole = "admin" | "user";

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  announcement: string;
  showAnnouncement: boolean;
  updatedAt: string;
}

export interface AppState {
  videoLinks: VideoLink[];
  journalEntries: JournalEntry[];
  beehives: Beehive[];
  inspections: BeeInspection[];
  poultries: Poultry[];
  feedingRecords: FeedingRecord[];
  eggRecords: EggRecord[];
  cropPlots: CropPlot[];
  gardenLogs: GardenLog[];
}
