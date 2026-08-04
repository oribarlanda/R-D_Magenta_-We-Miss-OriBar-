import chainData from "../../../data/chain.json";
import ChainGame from "@/components/games/ChainGame";
import GamePageWrapper from "@/components/ui/GamePageWrapper";

export default function ChainPage() {
  return (
    <GamePageWrapper title="השרשרת" icon="⛓️" subtitle={`חברו בין "${chainData.start}" לבין "${chainData.end}"`}>
      <ChainGame data={chainData} />
    </GamePageWrapper>
  );
}
