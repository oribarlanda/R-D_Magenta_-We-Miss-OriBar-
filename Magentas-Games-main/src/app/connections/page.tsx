import connectionsData from "../../../data/connections.json";
import ConnectionsGame from "@/components/games/ConnectionsGame";
import GamePageWrapper from "@/components/ui/GamePageWrapper";

export default function ConnectionsPage() {
  return (
    <GamePageWrapper title="מה הקשר" icon="🔗" subtitle={`בחרו 4 מילים בכל קבוצה. יש לכם ${connectionsData.attempts} ניסיונות.`}>
      <ConnectionsGame data={connectionsData} />
    </GamePageWrapper>
  );
}
