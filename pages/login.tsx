import classNames from "classnames";
import Input from "components/input";
import useUser from "lib/auth";
import fetchJson, { FetchError } from "lib/fetch";
import { Magic } from "magic-sdk";
import type { NextPage } from "next";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type FormValues = {
  email: string;
};

const Login: NextPage = () => {
  const { mutateUser } = useUser({
    redirectTo: "/app",
    redirectIfFound: true,
  });
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
      const magic = new Magic(
        process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || ""
      );
      const didToken = await magic.auth.loginWithEmailOTP({
        email: data.email,
      });
      await mutateUser(
        await fetchJson("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + didToken,
          },
        })
      );
    } catch (error) {
      if (error instanceof FetchError) {
        setError("email", { message: error.data.message });
      } else {
        console.error(error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="background"></div>
      <form
        className="bg-white w-full max-w-sm border-2 border-gray-100 rounded-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="text-center border-b-2 border-gray-100 p-8">
          <h3 className="font-semibold mb-2 text-lg">Sign in to PaymentKit</h3>
          <p className="text-sm text-gray-500 font-medium">
            We&apos;ll create an account if you <br />
            don&apos;t have one yet.
          </p>
        </div>
        <div className="p-8">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="Enter your email address"
            register={register}
            errors={errors}
            validation={{
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Please enter a valid e-mail address",
              },
            }}
          />

          <button
            className={classNames("btn", { loading })}
            disabled={loading}
            type="submit"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
