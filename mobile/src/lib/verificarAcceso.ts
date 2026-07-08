import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_PASS_KEY = "pase_24h";

export type AccessResult = {
  puedeSaltarAds: boolean;
  tienePase24h: boolean;
};

export async function verificarAcceso(): Promise<AccessResult> {
  const passRaw = await AsyncStorage.getItem(DAILY_PASS_KEY);
  const tienePase24h = passRaw ? Date.now() < Number(passRaw) : false;
  return { puedeSaltarAds: tienePase24h, tienePase24h };
}

export async function activarPase24h(): Promise<void> {
  const expira = Date.now() + 24 * 60 * 60 * 1000;
  await AsyncStorage.setItem(DAILY_PASS_KEY, String(expira));
}
