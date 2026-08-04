import songsData from "../../../data/songs.json";
import WhichSongGame from "@/components/games/WhichSongGame";
import GamePageWrapper from "@/components/ui/GamePageWrapper";

export default function WhichSongPage() {
  return (
    <GamePageWrapper title="איזה שיר" icon="🎵" subtitle="נחשו שם שיר לפי התיאור. ניתן להשתמש ברמזים.">
      <WhichSongGame data={songsData} />
    </GamePageWrapper>
  );
}
