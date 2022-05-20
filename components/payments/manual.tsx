import useUser from "lib/auth";
import { RapydPayment } from "./rapyd";

export const ManualPayment: React.FC<{ payment: any }> = ({ payment }) => {
  const { user } = useUser();

  return (
    <RapydPayment
      payment={payment}
      card={true}
      tips={user?.account?.allow_tips || false}
    />
  );
};
