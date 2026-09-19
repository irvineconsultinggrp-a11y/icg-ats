import { RoundBoard } from "../_components/RoundBoard";

export default function Round2Page() {
  return (
    <RoundBoard
      round={2}
      title="Individual Round 2"
      subtitle="Second 1-on-1 interview round. Accept applicants to the BBQ Social."
      advanceLabel="Accept to BBQ Social"
      advancePatch={{ r2_status: "completed", social_status: "accepted" }}
    />
  );
}
