import { useState, useEffect, useCallback } from "react";
import type { AppState } from "@/types";

const STORAGE_KEY = "tianyuan-app-state";

const defaultState: AppState = {
  beehives: [],
  inspections: [],
  poultries: [],
  feedingRecords: [],
  eggRecords: [],
  cropPlots: [],
  gardenLogs: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return defaultState;
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useLocalStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addItem = useCallback(<K extends keyof AppState>(key: K, item: AppState[K][number]) => {
    setState((prev) => {
      const arr = prev[key] as AppState[K];
      return { ...prev, [key]: [...arr, item] };
    });
  }, []);

  const updateItem = useCallback(<K extends keyof AppState>(key: K, id: string, updates: Partial<AppState[K][number]>) => {
    setState((prev) => {
      const arr = prev[key] as AppState[K];
      const newArr = arr.map((item) =>
        (item as { id: string }).id === id ? { ...item, ...updates } : item
      );
      return { ...prev, [key]: newArr };
    });
  }, []);

  const removeItem = useCallback(<K extends keyof AppState>(key: K, id: string) => {
    setState((prev) => {
      const arr = prev[key] as AppState[K];
      const newArr = arr.filter((item) => (item as { id: string }).id !== id);
      return { ...prev, [key]: newArr };
    });
  }, []);

  const getItems = useCallback(<K extends keyof AppState>(key: K): AppState[K] => {
    return state[key];
  }, [state]);

  const seedDemoData = useCallback(() => {
    const now = new Date().toISOString();
    const today = now.split("T")[0];

    setState({
      beehives: [
        { id: "h1", name: "东院蜂箱 A", location: "东院槐树下", queenAge: 8, queenStatus: "healthy", colonyStrength: "strong", lastInspection: today, notes: "产蜜旺季", createdAt: now },
        { id: "h2", name: "西坡蜂箱 B", location: "西坡油菜花田", queenAge: 14, queenStatus: "weak", colonyStrength: "medium", lastInspection: today, notes: "需关注蜂王更替", createdAt: now },
        { id: "h3", name: "后院蜂箱 C", location: "后院枣树旁", queenAge: 3, queenStatus: "healthy", colonyStrength: "strong", lastInspection: today, notes: "新分蜂群，发展良好", createdAt: now },
      ],
      inspections: [
        { id: "i1", hiveId: "h1", date: today, honeyFrames: 6, broodPattern: "excellent", pests: [], mood: "calm", actionTaken: "添加巢础", notes: "蜂蜜储备充足" },
        { id: "i2", hiveId: "h2", date: today, honeyFrames: 3, broodPattern: "good", pests: ["蜂螨轻微"], mood: "defensive", actionTaken: "放置螨虫贴", notes: "下周复查" },
      ],
      poultries: [
        { id: "p1", type: "chicken", breed: "芦花鸡", name: "花花", age: 180, gender: "hen", status: "active", createdAt: now },
        { id: "p2", type: "chicken", breed: "乌骨鸡", name: "小黑", age: 120, gender: "hen", status: "brooding", createdAt: now },
        { id: "p3", type: "duck", breed: "麻鸭", name: "嘎嘎", age: 90, gender: "hen", status: "active", createdAt: now },
        { id: "p4", type: "goose", breed: "狮头鹅", name: "大白", age: 365, gender: "rooster", status: "active", createdAt: now },
      ],
      feedingRecords: [
        { id: "f1", poultryId: null, date: today, feedType: "玉米碎 + 麦麸", amount: 500, notes: "混合饲料，全员" },
      ],
      eggRecords: [
        { id: "e1", date: today, count: 8, type: "chicken" },
        { id: "e2", date: today, count: 2, type: "duck" },
      ],
      cropPlots: [
        { id: "c1", name: "A区番茄", crop: "番茄", season: "summer", plantedDate: "2026-04-15", expectedHarvest: "2026-07-20", status: "fruiting", area: 12, notes: "长势喜人，已开始挂果", createdAt: now },
        { id: "c2", name: "B区黄瓜", crop: "黄瓜", season: "summer", plantedDate: "2026-05-01", expectedHarvest: "2026-07-10", status: "flowering", area: 8, notes: "藤蔓爬架完成", createdAt: now },
        { id: "c3", name: "C区小青菜", crop: "小青菜", season: "spring", plantedDate: "2026-03-20", expectedHarvest: "2026-05-15", status: "harvested", area: 10, notes: "已收获完成，准备轮作", createdAt: now },
        { id: "c4", name: "D区胡萝卜", crop: "胡萝卜", season: "autumn", plantedDate: "2026-08-01", expectedHarvest: "2026-11-01", status: "dormant", area: 6, notes: "秋季播种，等待季节", createdAt: now },
      ],
      gardenLogs: [
        { id: "g1", plotId: "c1", date: today, action: "watered", detail: "早晚各浇一次，保持土壤湿润" },
        { id: "g2", plotId: "c1", date: today, action: "fertilized", detail: "追施有机鸡粪肥 2kg" },
        { id: "g3", plotId: "c2", date: today, action: "pruned", detail: "摘除底部老叶，增加通风" },
      ],
    });
  }, []);

  const hasData = state.beehives.length > 0 || state.poultries.length > 0 || state.cropPlots.length > 0;

  return {
    state,
    addItem,
    updateItem,
    removeItem,
    getItems,
    seedDemoData,
    hasData,
  };
}
