import whoamiData from "../../../data/whoami.json";
import WhoAmIGame from "@/components/games/WhoAmIGame";
import GamePageWrapper from "@/components/ui/GamePageWrapper";

export default function WhoAmIPage() {
  return (
    <GamePageWrapper title="מי אני" icon="🕵️" subtitle="נחשו מי הדמות המסתורית בתמונה.">
      <WhoAmIGame data={whoamiData} />
    </GamePageWrapper>
  );
}
