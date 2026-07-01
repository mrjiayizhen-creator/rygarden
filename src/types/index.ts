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

export type Page = "dashboard" | "bee" | "poultry" | "garden" | "settings";

export interface AppState {
  beehives: Beehive[];
  inspections: BeeInspection[];
  poultries: Poultry[];
  feedingRecords: FeedingRecord[];
  eggRecords: EggRecord[];
  cropPlots: CropPlot[];
  gardenLogs: GardenLog[];
}
