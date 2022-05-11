const FormsLayout: React.FC<{ children: JSX.Element }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="background"></div>
      {children}
    </div>
  );
};

export default FormsLayout;
