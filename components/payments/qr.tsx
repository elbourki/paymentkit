import { useState, useEffect } from "react";
import Image from "next/image";

export const PaymentQR: React.FC<{ payment: any }> = ({ payment }) => {
  const [png, setPng] = useState(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  );
  const link = `${process.env.NEXT_PUBLIC_SHORT_URL}/${payment?.short_id}`;

  const blobToBase64 = (blob: Blob) => {
    return new Promise<string | ArrayBuffer | null>((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    (async () => {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: link,
        dotsOptions: {
          type: "rounded",
        },
      });
      let blob: string | ArrayBuffer | Blob | null = await qrCode.getRawData(
        "png"
      );
      if (blob) blob = await blobToBase64(blob);
      if (blob) setPng(blob as string);
    })();
  }, [link]);

  return (
    <div className="text-center self-center my-auto">
      <h2 className="font-semibold mb-6 text-lg">Scan QR code to pay</h2>
      <Image src={png} layout="raw" alt="QR code" width={300} height={300} />
    </div>
  );
};
