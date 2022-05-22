import classNames from "classnames";

const GuestLayout: React.FC<{
  children: JSX.Element;
  col?: boolean;
}> = ({ children, col }) => {
  return (
    <div
      className={classNames(
        "min-h-screen bg-gradient flex items-center p-6 relative",
        {
          "flex-col justify-between gap-6": col,
          "justify-center": !col,
        }
      )}
    >
      {children}
    </div>
  );
};

export default GuestLayout;
