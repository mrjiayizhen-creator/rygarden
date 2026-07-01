import { useState, useEffect, useCallback } from "react";
import type { AppState } from "@/types";

const GUEST_KEY = "tianyuan-app-state";

const defaultState: AppState = {
  beehives: [],
  inspections: [],
  poultries: [],
  feedingRecords: [],
  eggRecords: [],
  cropPlots: [],
  gardenLogs: [],
  videoLinks: [],
  journalEntries: [],
};

function getStorageKey(userId: string | null): string {
  return userId ? `tianyuan-app-state-${userId}` : GUEST_KEY;
}

function loadState(userId: string | null): AppState {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return { ...defaultState };
}

export function useLocalStore(userId: string | null = null) {
  const [state, setState] = useState<AppState>(() => loadState(userId));

  // When userId changes, reload data for that user
  useEffect(() => {
    setState(loadState(userId));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  }, [state, userId]);

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
      videoLinks: [],
      journalEntries: [
        { id: "j1", title: "春日的第一批蜜蜂", content: "今天东院的槐花全开了，蜜蜂出勤率明显上升。蜂箱 A 的工蜂忙得不可开交，巢门口进进出出的花粉篮都是黄澄澄的槐花粉。\n\n检查时发现蜂王产卵非常活跃，子脾面积比上周增加了将近一倍。看来今年春天的蜜源很不错，期待第一次摇蜜！", mood: "excited", createdAt: now, updatedAt: now },
        { id: "j2", title: "芦花鸡孵蛋观察", content: "花花今天已经趴窝第 18 天了，按照孵化周期应该就在这两天出壳。\n\n我轻轻靠近听了听，能听到蛋壳里传来的微弱啾啾声，小鸡已经在啄壳了！给花花准备了温水和新鲜小米，她几乎寸步不离。\n\n期待明天能看到小鸡崽。", mood: "happy", createdAt: now, updatedAt: now },
        { id: "j3", title: "小青菜丰收", content: "C区的上海青今天全部收获完毕！从播种到采收只用了 55 天，比预期还快了 5 天。\n\n产量统计：约 15 斤，品质很好，叶子翠绿水灵。留了一半自家吃，另一半送给了隔壁王叔。\n\n下一茬准备种空心菜，已经整好地了。", mood: "grateful", createdAt: now, updatedAt: now },
      ],
    });
  }, []);

  const hasData = state.beehives.length > 0 || state.poultries.length > 0 || state.cropPlots.length > 0 || state.journalEntries.length > 0;

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
