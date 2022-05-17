import { useState, useRef, useEffect, Fragment } from "react";
import useUser, { User } from "lib/auth";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import MajesticonsBellLine from "~icons/majesticons/bell-line";
import MajesticonsUserLine from "~icons/majesticons/user-line";
import MajesticonsCheckboxListDetailLine from "~icons/majesticons/checkbox-list-detail-line";
import MajesticonsChartBarLine from "~icons/majesticons/chart-bar-line";
import MajesticonsLogoutHalfCircleLine from "~icons/majesticons/logout-half-circle-line";
import MajesticonsBoxLine from "~icons/majesticons/box-line";
import MajesticonsSettingsCogLine from "~icons/majesticons/settings-cog-line";
import MajesticonsSortHorizontalLine from "~icons/majesticons/sort-horizontal-line";
import {
  KnockFeedProvider,
  NotificationFeedPopover,
  UnseenBadge,
} from "@knocklabs/react-notification-feed";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";
import Image from "next/image";
import { Menu } from "@headlessui/react";
import fetchJson from "lib/fetch";
import { KeyedMutator } from "swr";

const TopBar: React.FC<{
  mutateUser: KeyedMutator<User>;
  className?: string;
}> = ({ mutateUser, className }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsBtn = useRef(null);

  const logout = async () => {
    await mutateUser(
      await fetchJson("/api/logout", {
        method: "POST",
      })
    );
  };

  return (
    <div className={classNames("p-6 flex justify-between", className)}>
      <Image
        src="/assets/logo.svg"
        alt="PaymentKit logo"
        width={24}
        height={24}
      />
      <div className="text-base flex gap-3">
        <button
          className="relative"
          ref={notificationsBtn}
          onClick={() => setNotificationsOpen(!notificationsOpen)}
        >
          <MajesticonsBellLine />
          <UnseenBadge />
        </button>
        <NotificationFeedPopover
          buttonRef={notificationsBtn}
          isVisible={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
        <Menu as="div" className="relative flex">
          <Menu.Button>
            <MajesticonsUserLine />
          </Menu.Button>
          <Menu.Items className="absolute right-0 md:right-auto md:left-0 mt-8 w-44 origin-top-left rounded-md bg-white border-2">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      "group flex w-full items-center gap-1 rounded-md px-2 py-2 text-sm font-bold",
                      {
                        "bg-teal-600 text-white": active,
                      }
                    )}
                    onClick={logout}
                  >
                    <MajesticonsLogoutHalfCircleLine />
                    Logout
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
};

const AppLayout: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const router = useRouter();
  const { user, mutateUser } = useUser({ redirectTo: "/login" });
  const [client, setClient] =
    useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const links = [
    {
      link: "/app",
      title: "Overview",
      icon: MajesticonsChartBarLine,
    },
    {
      link: "/app/payments",
      title: "Payments",
      icon: MajesticonsCheckboxListDetailLine,
    },
    {
      link: "/app/payments/new",
      title: "New payment",
      icon: MajesticonsSortHorizontalLine,
    },
    {
      link: "/app/products",
      title: "Products",
      icon: MajesticonsBoxLine,
    },
    {
      link: "/app/settings",
      title: "Settings",
      icon: MajesticonsSettingsCogLine,
    },
  ];

  useEffect(() => {
    if (user?.account)
      setClient(
        new ApolloClient({
          link: new GraphQLWsLink(
            createClient({
              url: `wss://${process.env.NEXT_PUBLIC_HASURA_INSTANCE}/v1/graphql`,
              connectionParams: {
                headers: {
                  Authorization: `Bearer ${user.hasura_token}`,
                },
              },
            })
          ),
          cache: new InMemoryCache(),
        })
      );
  }, [user]);

  if (user && !user.account) router.push("/app/onboarding");

  if (!user?.account || !client)
    return (
      <div className="flex justify-center items-center flex-col min-h-screen relative">
        <div className="background"></div>
        <div className="animate-spin spinner" />
        <h3 className="mt-4 text-sm font-semibold">Please wait</h3>
      </div>
    );

  return (
    <KnockFeedProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_KEY || ""}
      feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_ID || ""}
      userId={user.id}
      userToken={user.knock_token}
      rootless={true}
    >
      <ApolloProvider client={client}>
        <div className="min-h-screen relative flex">
          <div className="hidden md:flex flex-col w-[250px] border-r-2 border-gray-200 flex-shrink-0">
            <TopBar mutateUser={mutateUser} />
            <div className="flex flex-col gap-5 p-6">
              {links.map((link) => (
                <Link key={link.link} href={link.link}>
                  <a
                    className={classNames("flex gap-3 items-center", {
                      "text-teal-700": router.pathname === link.link,
                    })}
                  >
                    <link.icon />
                    <span className="font-semibold text-sm">{link.title}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <TopBar className="md:hidden" mutateUser={mutateUser} />
            {children}
            <div className="md:hidden flex justify-around p-6 sticky bottom-0 w-full backdrop-blur bg-white/50 mt-auto">
              {links.map((link) => (
                <Link key={link.link} href={link.link}>
                  <a
                    className={classNames("text-lg", {
                      "text-teal-700": router.pathname === link.link,
                    })}
                  >
                    <link.icon />
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ApolloProvider>
    </KnockFeedProvider>
  );
};

export default AppLayout;
