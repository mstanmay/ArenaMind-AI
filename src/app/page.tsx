import LandingClient from "@/components/LandingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArenaMind AI — Smart Stadium & Tournament Operations Command Center",
  description: "Next-generation enterprise AI platform for crowd intelligence, digital twins, tournament operations, and stadium analytics.",
};

export default function LandingPage() {
  return <LandingClient />;
}
