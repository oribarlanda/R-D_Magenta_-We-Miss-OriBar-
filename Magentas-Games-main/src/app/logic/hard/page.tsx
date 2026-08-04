import logicHardData from "../../../../data/logic-hard.json";
import LogicGame from "@/components/games/LogicGame";
import GamePageWrapper from "@/components/ui/GamePageWrapper";

export default function LogicHardPage() {
  return (
    <GamePageWrapper title="הגיונית – קשה" icon="🔴" subtitle="קראו בעיון, חישבו מחוץ לקופסה.">
      <LogicGame data={logicHardData} gameId="logic-hard" />
    </GamePageWrapper>
  );
}
