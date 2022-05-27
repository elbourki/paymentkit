import type { NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import onlineDemo from "public/assets/demos/online.png";
import inPersonDemo from "public/assets/demos/in-person.png";
import quickDemo from "public/assets/demos/quick.png";
import tipsDemo from "public/assets/demos/tips.png";
import productsDemo from "public/assets/demos/products.png";
import ipadDemo from "public/assets/demos/ipad.png";
import rapydLogo from "public/assets/rapyd-logo.png";
import MajesticonsBriefcaseLine from "~icons/majesticons/briefcase-line";
import MajesticonsGlobeEarth2Line from "~icons/majesticons/globe-earth-2-line";
import MajesticonsDollarCircleLine from "~icons/majesticons/dollar-circle-line";
import MajesticonsMoneyHandLine from "~icons/majesticons/money-hand-line";

const Home: NextPage = () => {
  return (
    <div className="overflow-hidden">
      <Head>
        <title>
          PaymentKit - The easiest way to collect payments online and in-person
        </title>
      </Head>
      <div className="bg-gradient hero overflow-hidden relative min-h-[min(800px,100vh)] md:max-h-[800px] flex flex-col">
        <nav className="flex items-center justify-between p-6 w-full max-w-6xl self-center">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt="PaymentKit logo"
              width={24}
              height={24}
            />
            <span className="font-bold text-teal-800 cursor-default">
              PaymentKit
            </span>
          </div>
          <Link href="/login">
            <a className="rounded-md border-2 bg-teal-600 border-teal-600 font-semibold text-white hover:bg-teal-700 hover:border-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-teal-500 transition delay-100 ease-linear text-sm shadow-tiny py-2 px-5">
              Get started
            </a>
          </Link>
        </nav>
        <div className="flex flex-col md:flex-row w-full max-w-6xl pt-12 self-center justify-center flex-grow">
          <div className="w-full self-center px-6 pb-12 z-20">
            <h1 className="text-4xl leading-snug font-extrabold text-gradient">
              <span className="md:block">Omnichannel Payments</span> Made Easy
            </h1>
            <p className="text-lg font-medium text-teal-800 my-6">
              Ditch your archaic point-of-sale hardware and switch to a modern
              payment processing toolkit. Charge cards from all major card
              networks or create and share gorgeous payment links to let your
              customers pay online.
            </p>
            <Link href="/login">
              <a className="rounded-md border-2 bg-teal-600 border-teal-600 font-semibold text-white hover:bg-teal-700 hover:border-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-teal-500 transition delay-100 ease-linear text-sm shadow-tiny py-2 px-5 inline-block">
                Get started
              </a>
            </Link>
          </div>
          <div className="w-full relative hidden md:block">
            <Image
              className="h-full w-auto absolute bottom-0 max-w-none rounded-t-3xl shadow-2xl"
              layout="raw"
              src={ipadDemo}
              alt="iPad demo"
            />
          </div>
        </div>
      </div>
      <div className="pb-[12vw] pt-[2vw]">
        <div className="bg-gradient-r">
          <div className="flex flex-col md:flex-row items-center px-6 py-12 gap-12 w-full max-w-6xl mx-auto">
            <div className="w-full bg-teal-100 rounded-xl">
              <Image layout="raw" src={onlineDemo} alt="Selling online" />
            </div>
            <div className="w-full">
              <h1 className="text-4xl font-extrabold">Selling online</h1>
              <p className="text-lg font-medium text-slate-800 my-6">
                Generate a short memorable link that you can share via WhatsApp,
                Instagram, email, or just about anywhere. Let your customers
                enjoy a hyper-localized customer experience by allowing them to
                pay in their native currency with a payment method of their
                choosing. No account is required.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-l">
          <div className="flex flex-col-reverse md:flex-row items-center px-6 py-12 gap-12 w-full max-w-6xl mx-auto">
            <div className="w-full">
              <h1 className="text-4xl font-extrabold">Selling in-person</h1>
              <p className="text-lg font-medium text-slate-800 my-6">
                Let your customers scan a QR code or type in their card details
                manually. Eliminate the checkout line and handle high customer
                volumes by letting associates step out from behind the cash
                register and checkout customers right from their mobile devices.
              </p>
            </div>
            <div className="w-full bg-teal-100 rounded-xl">
              <Image layout="raw" src={inPersonDemo} alt="Selling in-person" />
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row px-6 py-12 gap-12 w-full max-w-6xl mx-auto items-center md:items-start">
          <div className="text-center w-full max-w-sm">
            <Image src={tipsDemo} alt="Tips" />
            <p className="text-sm font-semibold text-slate-800 my-6">
              Enable the tipping option to allow customers to add a tip based on
              their total.
            </p>
          </div>
          <div className="text-center w-full max-w-sm">
            <Image src={quickDemo} alt="Quick collect" />
            <p className="text-sm font-semibold text-slate-800 my-6">
              Quickly collect one-off payments by entering an amount and a
              description.
            </p>
          </div>
          <div className="text-center w-full max-w-sm">
            <Image src={productsDemo} alt="Products" />
            <p className="text-sm font-semibold text-slate-800 my-6">
              Speed up your checkout process by adding as many products as
              you&apos;d like.
            </p>
          </div>
        </div>
      </div>
      <div className="rapyd-section relative">
        <div className="flex flex-col items-center px-6 pt-6 pb-12 w-full max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 -mt-[5vw] flex-wrap justify-center text-center">
            <span>Payments powered by</span>
            <Image
              src={rapydLogo}
              layout="raw"
              alt="Rapyd logo"
              className="h-[1em] w-auto"
            />
          </h1>
          <div className="w-full grid md:grid-cols-2 gap-6 py-12 max-w-3xl">
            <div className="flex gap-3 items-center">
              <MajesticonsGlobeEarth2Line
                fontSize={20}
                className="flex-shrink-0"
              />
              <h5 className="text-lg font-semibold text-slate-800">
                Hundreds of payment methods across 100 countries worldwide.
              </h5>
            </div>
            <div className="flex gap-3 items-center">
              <MajesticonsDollarCircleLine
                fontSize={20}
                className="flex-shrink-0"
              />
              <h5 className="text-lg font-semibold text-slate-800">
                Let customers pay in their native currency, you get paid in
                yours.
              </h5>
            </div>
            <div className="flex gap-3 items-center">
              <MajesticonsBriefcaseLine
                fontSize={20}
                className="flex-shrink-0"
              />
              <h5 className="text-lg font-semibold text-slate-800">
                Supports businesses domiciled in over 70 countries.
              </h5>
            </div>
            <div className="flex gap-3 items-center">
              <MajesticonsMoneyHandLine
                fontSize={20}
                className="flex-shrink-0"
              />
              <h5 className="text-lg font-semibold text-slate-800">
                Accept cash, bank transfers, bank redirects, cash and eWallets.
              </h5>
            </div>
          </div>
          <Link href="/login">
            <a className="rounded-md border-2 bg-teal-600 border-teal-600 font-semibold text-white hover:bg-teal-700 hover:border-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-teal-500 transition delay-100 ease-linear text-sm shadow-tiny py-2 px-5 inline-block">
              Get started
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
