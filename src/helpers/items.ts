import { Payment, Team } from "@prisma/client";
import { PaylabsPayload } from "../types/paylabs";

export function buildPaylabsPayloadFromTeam(
  team: Team & { payment: Payment; leader: { phone: string | null } },
  storeId: string
): PaylabsPayload {
  const price = String(team.payment.amount);

  const items = [
    {
      id: team.id.slice(0, 10),
      name: `Registrasi Tim ${team.teamName}`,
      quantity: 1,
      price,
      type: "registration",
    },
  ];

  return {
    items,
    totalAmount: price,
    phoneNumber: team.leader.phone || "",
    paymentMethod: team.payment.method,
    storeId,
  };
}
