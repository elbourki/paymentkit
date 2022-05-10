import classNames from "classnames";
import Input from "components/input";
import useUser from "lib/auth";
import fetchJson, { FetchError } from "lib/fetch";
import type { NextPage } from "next";
import Router from "next/router";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import rapyd from "public/assets/rapyd.png";

type FormValues = {
  access_key: string;
  secret_key: string;
  sandbox: boolean;
};

const OnBoarding: NextPage = () => {
  const { user, mutateUser } = useUser({ redirectTo: "/login" });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      await mutateUser(
        await fetchJson("/api/connect-rapyd", {
          method: "POST",
          json: data,
        })
      );
    } catch (error) {
      if (error instanceof FetchError) {
        setError("secret_key", { message: error.data.message });
      } else {
        console.error(error);
      }
    }
    setLoading(false);
  };

  if (user && user.account) Router.push("/app");

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="background"></div>
      <form
        className="bg-white w-full max-w-sm border-2 border-gray-100 rounded-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="text-center border-b-2 border-gray-100 p-8 relative">
          <h3 className="font-semibold mb-2 text-lg">
            Connect your Rapyd account
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            You can find these details in the developers section of your Rapyd
            dashboard.
          </p>
          <Image
            className="absolute right-0 bottom-0 opacity-5 pointer-events-none"
            layout="raw"
            width={100}
            alt="Rapyd logo"
            src={rapyd}
          />
        </div>
        <div className="p-8 flex flex-col gap-4">
          <Input
            id="access_key"
            label="Access key"
            type="password"
            register={register}
            errors={errors}
            validation={{
              required: true,
            }}
          />
          <Input
            id="secret_key"
            label="Secret key"
            type="password"
            register={register}
            errors={errors}
            validation={{
              required: true,
            }}
          />
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register("sandbox")}
              className="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-500 focus:ring-transparent"
            />
            <span className="ml-2 font-medium text-gray-800 text-sm">
              Enable Sandbox mode
            </span>
          </label>
          <button
            className={classNames("btn", { loading })}
            disabled={loading}
            type="submit"
          >
            Connect
          </button>
          <div className="text-sm text-center font-medium text-gray-600">
            Don&apos;t have a Rapyd account?{" "}
            <a
              href="https://dashboard.rapyd.net/sign-up"
              target="_blank"
              rel="noreferrer"
              className="text-teal-600"
            >
              Sign up
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OnBoarding;
