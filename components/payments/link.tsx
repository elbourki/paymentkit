import MajesticonsClipboardCopyLine from "~icons/majesticons/clipboard-copy-line";
import MajesticonsCheckLine from "~icons/majesticons/check-line";
import PhMessengerLogoBold from "~icons/ph/messenger-logo-bold";
import PhWhatsappLogoBold from "~icons/ph/whatsapp-logo-bold";
import PhTelegramLogoBold from "~icons/ph/telegram-logo-bold";
import MajesticonsMailLine from "~icons/majesticons/mail-line";
import MajesticonsShareLine from "~icons/majesticons/share-line";
import classNames from "classnames";
import { useState } from "react";

export const PaymentLink: React.FC<{ payment: any }> = ({ payment }) => {
  const [copied, setCopied] = useState(false);
  const link = `${process.env.NEXT_PUBLIC_SHORT_URL}/${payment?.short_id}`;

  return (
    <>
      <label>
        <span className="block font-medium text-sm">Your payment link</span>
        <input
          className={classNames("input", {
            "border-red-200 focus:border-red-200 focus:bg-red-50": false,
          })}
          type="text"
          disabled
          value={link}
        />
      </label>
      <div className="border-2 rounded-md divide-y-2">
        <button
          className="flex p-3 gap-3 text-sm font-semibold items-center w-full"
          onClick={() =>
            navigator.clipboard.writeText(link).then(() => setCopied(true))
          }
        >
          {copied ? <MajesticonsCheckLine /> : <MajesticonsClipboardCopyLine />}
          Copy to clipboard
        </button>
        <a
          className="flex p-3 gap-3 text-sm font-semibold items-center"
          href={`https://wa.me/?text=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noreferrer"
        >
          <PhWhatsappLogoBold />
          Share via Whatsapp
        </a>
        <a
          className="flex p-3 gap-3 text-sm font-semibold items-center"
          href={`https://www.facebook.com/dialog/send?app_id=389569059747708&link=${encodeURIComponent(
            link
          )}&redirect_uri=${process.env.NEXT_PUBLIC_SHORT_URL}`}
          target="_blank"
          rel="noreferrer"
        >
          <PhMessengerLogoBold />
          Share via Messenger
        </a>
        <a
          className="flex p-3 gap-3 text-sm font-semibold items-center"
          href={`https://t.me/share/url?url=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noreferrer"
        >
          <PhTelegramLogoBold />
          Share via Telegram
        </a>
        <a
          className="flex p-3 gap-3 text-sm font-semibold items-center"
          href={`mailto:?body=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noreferrer"
        >
          <MajesticonsMailLine />
          Share via email
        </a>
        <button
          className="flex p-3 gap-3 text-sm font-semibold items-center w-full"
          onClick={() => navigator.share({ url: link })}
        >
          <MajesticonsShareLine />
          Other sharing options
        </button>
      </div>
    </>
  );
};
