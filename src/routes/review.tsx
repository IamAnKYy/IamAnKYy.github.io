import { createFileRoute } from "@tanstack/react-router";
import { ReviewSession } from "./study.$deckId.review";

export const Route = createFileRoute("/review")({
  component: GlobalReview,
});

function GlobalReview() {
  return <ReviewSession scope={{}} backTo={{ to: "/" }} />;
}