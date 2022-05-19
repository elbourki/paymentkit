import { RapydPayment } from "./rapyd";

export const ManualPayment: React.FC<{ payment: any }> = ({ payment }) => {
  return (
    <RapydPayment
      payment_id={payment.id}
      payment_status={payment.status}
      card={true}
    />
  );
};
