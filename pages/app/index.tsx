import AppLayout from "components/layouts/app";
import useUser from "lib/auth";
import Router from "next/router";
import { NextPageWithLayout } from "typings/types";

const App: NextPageWithLayout = () => {
  const { user } = useUser();

  return <div></div>;
};

App.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export default App;
