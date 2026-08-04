import logicEasyData from "../../../../data/logic-easy.json";
import LogicGame from "@/components/games/LogicGame";
import GamePageWrapper from "@/components/ui/GamePageWrapper";

export default function LogicEasyPage() {
  return (
    <GamePageWrapper title="הגיונית – קל" icon="🟢" subtitle="קראו בעיון, חישבו מחוץ לקופסה.">
      <LogicGame data={logicEasyData} gameId="logic-easy" />
    </GamePageWrapper>
  );
}
