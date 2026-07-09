import { fetchLiveChannels } from "@/lib/iptv";
import { liveChannelSubtitle } from "@/lib/live-channels";
import { MonetizedLivePlayer } from "@/components/MonetizedLivePlayer";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EnVivoCanalPage({ params }: Props) {
  const { id } = await params;
  const { lives, deportesCanales } = await fetchLiveChannels();
  const canal = [...lives, ...deportesCanales].find((c) => c.id === id);
  if (!canal) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">{canal.nombre}</h1>
      <p className="mb-6 text-sm text-brand-muted">{liveChannelSubtitle(canal)}</p>
      <MonetizedLivePlayer streamUrl={canal.streamUrl} titulo={canal.nombre} />
    </main>
  );
}
