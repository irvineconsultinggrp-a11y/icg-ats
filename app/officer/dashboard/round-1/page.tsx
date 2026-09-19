import { RoundBoard } from "../_components/RoundBoard";

export default function Round1Page() {
  return (
    <RoundBoard
      round={1}
      title="Individual Round 1"
      subtitle="First 1-on-1 interview round. Score each applicant and advance them to Round 2."
      advanceLabel="Advance to Round 2"
      advancePatch={{ gi_status: "completed" }}
    />
  );
}
