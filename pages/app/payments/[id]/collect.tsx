import { gql, useSubscription } from "@apollo/client";
import { RadioGroup } from "@headlessui/react";
import classNames from "classnames";
import AppLayout from "components/layouts/app";
import Router, { useRouter } from "next/router";
import { useState } from "react";
import { NextPageWithLayout } from "typings/types";
import MajesticonsLinkLine from "~icons/majesticons/link-line";
import MajesticonsCreditcardHandLine from "~icons/majesticons/creditcard-hand-line";
import MajesticonsQrCodeLine from "~icons/majesticons/qr-code-line";
import MajesticonsArrowLeftLine from "~icons/majesticons/arrow-left-line";
import { PaymentLink } from "components/payments/link";
import { PaymentQR } from "components/payments/qr";
import { ManualPayment } from "components/payments/manual";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions, User } from "lib/auth";
import Script from "next/script";
import { amount } from "lib/shared";

const options = [
  {
    type: "link",
    name: "Payment link",
    description: "Create and share a link to collect payments online",
    icon: MajesticonsLinkLine,
    component: PaymentLink,
  },
  {
    type: "qr",
    name: "QR code",
    description: "Let customers scan and pay on their own device",
    icon: MajesticonsQrCodeLine,
    component: PaymentQR,
  },
  {
    type: "manual",
    name: "Manual input",
    description: "Type in your customer's credit card details manually",
    icon: MajesticonsCreditcardHandLine,
    component: ManualPayment,
  },
];

const Collect: NextPageWithLayout<{ user: User }> = (props) => {
  const {
    query: { id },
  } = useRouter();
  const { loading, data, error } = useSubscription(
    gql`
      subscription ($id: uuid!) {
        payments_by_pk(id: $id) {
          id
          short_id
          amount
          currency
          status
        }
      }
    `,
    {
      variables: {
        id,
      },
    }
  );
  const [selected, setSelected] = useState("link");
  const [confirmed, setConfirmed] = useState(false);

  if (loading)
    return (
      <div className="flex justify-center items-center flex-col flex-grow">
        <div className="animate-spin spinner" />
        <h3 className="mt-4 text-sm font-semibold">Loading...</h3>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center flex-col flex-grow">
        <h3 className="mt-4 text-sm font-semibold">Something went wrong</h3>
      </div>
    );

  const payment = data.payments_by_pk;
  const option = options.find(({ type }) => type === selected) || options[0];

  const back = () => {
    if (confirmed) setConfirmed(false);
    else Router.push(`/app/payments/${payment.id}`);
  };

  return (
    <div className="p-6 flex-grow flex flex-col gap-6 max-w-md self-center w-full">
      <div>
        <button
          className="flex gap-2 items-center mb-2 text-sm font-medium"
          onClick={back}
        >
          <MajesticonsArrowLeftLine />
          Back
        </button>
        <h1 className="font-bold text-2xl">
          {amount(payment.amount, payment.currency)}
        </h1>
      </div>
      {confirmed ? (
        <option.component payment={payment} />
      ) : (
        <>
          <RadioGroup value={selected} onChange={setSelected}>
            <RadioGroup.Label className="block font-medium text-sm">
              Payment option
            </RadioGroup.Label>
            <div className="space-y-2 mt-2">
              {options.map((plan) => (
                <RadioGroup.Option
                  key={plan.type}
                  value={plan.type}
                  className={({ checked }) =>
                    classNames(
                      "relative flex items-center gap-4 cursor-pointer rounded-lg px-5 py-4 border-2 focus:outline-none",
                      {
                        "bg-teal-600 text-white border-teal-600": checked,
                      }
                    )
                  }
                >
                  {({ checked }) => (
                    <>
                      <plan.icon className="flex-shrink-0" fontSize={25} />
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={classNames("font-medium", {
                            "text-white": checked,
                          })}
                        >
                          {plan.name}
                        </RadioGroup.Label>
                        <RadioGroup.Description
                          as="span"
                          className={classNames(
                            "inline",
                            checked ? "text-sky-100" : "text-gray-500"
                          )}
                        >
                          <span>{plan.description}</span>
                        </RadioGroup.Description>
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
          <button className="btn mt-auto" onClick={() => setConfirmed(true)}>
            Continue
          </button>
        </>
      )}
      <Script
        src={`https://${
          props.user.account?.sandbox ? "sandbox" : ""
        }checkouttoolkit.rapyd.net`}
      />
    </div>
  );
};

Collect.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export const getServerSideProps = withIronSessionSsr(async function ({ req }) {
  return {
    props: { user: req.session.user },
  };
}, sessionOptions);

export default Collect;
