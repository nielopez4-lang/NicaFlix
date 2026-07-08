import { AdBannerSlot } from "@/components/AdBannerSlot";
import { loadLiveData } from "@/lib/content";
import { fetchSports } from "@/lib/sports-api";
import type { LiveChannel, LiveScore, StandingsRow } from "@/types/content";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function LiveCard({ game }: { game: LiveScore }) {
  return (
    <View style={[styles.liveCard, game.isLive && styles.liveCardActive]}>
      <View style={styles.liveCardHeader}>
        <Text style={styles.league}>{game.league}</Text>
        {game.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>EN VIVO</Text>
          </View>
        )}
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.team} numberOfLines={1}>
          {game.awayAbbr}
        </Text>
        <Text style={styles.score}>{game.awayScore ?? "–"}</Text>
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.team} numberOfLines={1}>
          {game.homeAbbr}
        </Text>
        <Text style={styles.score}>{game.homeScore ?? "–"}</Text>
      </View>
      {game.period ? <Text style={styles.period}>{game.period}</Text> : null}
    </View>
  );
}

function StandingsMini({ title, rows }: { title: string; rows: StandingsRow[] }) {
  const top = rows.slice(0, 8);
  if (!top.length) return null;
  return (
    <View style={styles.standingsBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {top.map((r) => (
        <View key={`${r.league}-${r.team}`} style={styles.standingRow}>
          <Text style={styles.standingRank}>{r.rank}</Text>
          <Text style={styles.standingTeam} numberOfLines={1}>
            {r.team}
          </Text>
          <Text style={styles.standingStat}>
            {r.points !== undefined ? `${r.points} pts` : `${r.wins}-${r.losses}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function DeportesScreen() {
  const router = useRouter();
  const [deportes, setDeportes] = useState<LiveChannel[]>([]);
  const [live, setLive] = useState<LiveScore[]>([]);
  const [upcoming, setUpcoming] = useState<LiveScore[]>([]);
  const [mlbStandings, setMlbStandings] = useState<StandingsRow[]>([]);
  const [soccerStandings, setSoccerStandings] = useState<StandingsRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [liveData, sports] = await Promise.all([
        loadLiveData(),
        fetchSports(),
      ]);
      setDeportes(liveData.deportesCanales);
      setLive(sports.liveScores);
      setUpcoming(sports.upcoming);
      setMlbStandings(sports.mlbStandings);
      setSoccerStandings(sports.soccerStandings);
    } catch {
      const liveData = await loadLiveData();
      setDeportes(liveData.deportesCanales);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E50914" size="large" />
      </View>
    );
  }

  const tickerGames = live.length ? live : upcoming.slice(0, 5);

  return (
    <View style={styles.wrapper}>
      {live.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.ticker}
          contentContainerStyle={styles.tickerContent}
        >
          {live.map((g) => (
            <LiveCard key={g.id} game={g} />
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AdBannerSlot height={250} slot="DEPORTES_MID" style={styles.adSlot} />

        <Text style={styles.sectionTitle}>Marcadores del día</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tickerGames.map((g) => (
            <View key={g.id} style={styles.cardWrap}>
              <LiveCard game={g} />
            </View>
          ))}
        </ScrollView>

        <StandingsMini title="Tabla MLB" rows={mlbStandings} />
        <StandingsMini title="Fútbol internacional" rows={soccerStandings} />

        <Text style={styles.sectionTitle}>Canales ({deportes.length})</Text>
        <FlatList
          data={deportes}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.channelRow} onPress={() => router.push(`/live/${item.id}`)}>
              <Text style={styles.channelName}>{item.nombre}</Text>
              <Text style={styles.channelPais}>{item.pais}</Text>
            </Pressable>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#0B0B0F" },
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  center: { flex: 1, backgroundColor: "#0B0B0F", alignItems: "center", justifyContent: "center" },
  ticker: {
    maxHeight: 110,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,9,20,0.4)",
    backgroundColor: "#0a0a0f",
  },
  tickerContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  cardWrap: { marginRight: 10 },
  liveCard: {
    backgroundColor: "#14141A",
    borderRadius: 10,
    padding: 12,
    minWidth: 150,
    borderWidth: 1,
    borderColor: "#222",
  },
  liveCardActive: {
    borderColor: "#E50914",
    backgroundColor: "rgba(229,9,20,0.12)",
  },
  liveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  league: { color: "#8B8B9A", fontSize: 10, flex: 1 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E50914" },
  liveBadgeText: { color: "#E50914", fontSize: 9, fontWeight: "800" },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  team: { color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 },
  score: { color: "#fff", fontSize: 16, fontWeight: "800", marginLeft: 8 },
  period: { color: "#8B8B9A", fontSize: 10, marginTop: 4 },
  adSlot: { margin: 16 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", margin: 16, marginBottom: 8 },
  standingsBlock: { marginHorizontal: 16, marginBottom: 16 },
  standingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  standingRank: { color: "#8B8B9A", width: 28, fontWeight: "700" },
  standingTeam: { color: "#fff", flex: 1, fontSize: 13 },
  standingStat: { color: "#E50914", fontSize: 12, fontWeight: "600" },
  channelRow: {
    backgroundColor: "#14141A",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
  },
  channelName: { color: "#fff", fontWeight: "600" },
  channelPais: { color: "#8B8B9A", fontSize: 12, marginTop: 4 },
});
