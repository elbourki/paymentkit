import classNames from "classnames";
import { UseFormRegister } from "react-hook-form";

type Props = {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  register: UseFormRegister<any>;
  errors: {
    [x: string]: any;
  };
  validation: {
    [x: string]: any;
  };
};

const Input = ({
  id,
  type,
  label,
  placeholder,
  register,
  errors,
  validation,
}: Props) => {
  return (
    <label>
      <span className="block font-medium text-sm">{label}</span>
      <input
        className={classNames("input", {
          "border-red-200 focus:border-red-200 focus:bg-red-50": errors[id],
        })}
        {...register(id, validation)}
        type={type}
        placeholder={placeholder}
        required
      />
      {errors[id] && (
        <small className="text-red-600">{errors[id].message}</small>
      )}
    </label>
  );
};

export default Input;
